/**
 * utils.js  (v1.2.0 — improved truncate, added clearLogs)
 * utils.js
 *
 * Utility / helper functions for the Contact Center KMT.
 *
 * Responsibilities:
 *  - Logging completed sessions to logs.json
 *  - Clearing the log file on demand
 *  - Searching the tree for a keyword
 *  - Reading and formatting logs for display
 *  - Miscellaneous formatting helpers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Path helpers ────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOGS_PATH  = path.join(__dirname, 'logs.json');

// ─── Session Logging ─────────────────────────────────────────────────────────

/**
 * logSession
 *
 * Appends a completed traversal session to logs.json.
 * Each session records:
 *   - timestamp      : ISO date string
 *   - path           : array of choices the agent made (question → answer pairs)
 *   - resolution     : the final resolution text
 *   - escalated      : whether escalation was required
 *
 * @param {Array<{question: string, choice: string}>} sessionPath - Steps taken.
 * @param {{ resolution: string, escalate: boolean, steps: string[] }} leaf    - Final leaf node.
 */
export function logSession(sessionPath, leaf) {
  // Load existing logs or start fresh
  let logs = [];
  if (fs.existsSync(LOGS_PATH)) {
    try {
      const raw = fs.readFileSync(LOGS_PATH, 'utf-8');
      logs = JSON.parse(raw);
    } catch {
      logs = []; // corrupt file — reset
    }
  }

  // Build the session record
  const session = {
    id:         `session-${Date.now()}`,
    timestamp:  new Date().toISOString(),
    path:       sessionPath,
    resolution: leaf.resolution,
    escalated:  leaf.escalate,
  };

  logs.push(session);

  // Write back to disk
  fs.writeFileSync(LOGS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  return session.id;
}

// ─── Log Reading ─────────────────────────────────────────────────────────────

/**
 * readLogs
 *
 * Reads all sessions from logs.json and returns them as an array.
 * Returns an empty array if the file does not exist or is empty.
 *
 * @returns {Array} Array of session objects.
 */
export function readLogs() {
  if (!fs.existsSync(LOGS_PATH)) return [];
  try {
    const raw = fs.readFileSync(LOGS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ─── Keyword Search ──────────────────────────────────────────────────────────

/**
 * searchTree
 *
 * Performs a case-insensitive keyword search across all nodes of the
 * decision tree.  Returns a flat list of matching results, each containing:
 *   - label      : a short human-readable description of where the match was found
 *   - path       : the sequence of option labels to reach this node
 *   - node       : the matching tree node itself
 *
 * The search checks both question text and resolution text (for leaf nodes).
 *
 * @param {Object} treeNode  - Root (or any sub-root) of the tree.
 * @param {string} keyword   - The search term entered by the agent.
 * @returns {Array<{label: string, path: string[], node: Object}>}
 */
export function searchTree(treeNode, keyword) {
  const results = [];
  const kw = keyword.toLowerCase();

  /**
   * Recursive inner function.
   * @param {Object} node       - Current tree node being examined.
   * @param {string[]} pathSoFar - Labels taken to reach this node.
   */
  function traverse(node, pathSoFar) {
    if (!node) return;

    // ── LEAF NODE ────────────────────────────────────────────────────────────
    if (node.resolution !== undefined) {
      const matchesResolution = node.resolution.toLowerCase().includes(kw);
      const matchesSteps      = (node.steps || []).some(s => s.toLowerCase().includes(kw));
      const matchesPath       = pathSoFar.some(p => p.toLowerCase().includes(kw));

      if (matchesResolution || matchesSteps || matchesPath) {
        results.push({
          label: pathSoFar.join(' → ') || 'Root',
          path:  [...pathSoFar],
          node,
        });
      }
      return;
    }

    // ── QUESTION NODE ────────────────────────────────────────────────────────
    const matchesQuestion = node.question && node.question.toLowerCase().includes(kw);

    if (matchesQuestion) {
      // The question itself matches — include this as a navigation entry point
      results.push({
        label: (pathSoFar.join(' → ') || 'Root') + ' [Question match]',
        path:  [...pathSoFar],
        node,
      });
    }

    // Recurse into each child option
    if (node.options) {
      for (const [optionLabel, childNode] of Object.entries(node.options)) {
        traverse(childNode, [...pathSoFar, optionLabel]);
      }
    }
  }

  traverse(treeNode, []);
  return results;
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/**
 * formatTimestamp
 *
 * Converts an ISO timestamp string to a human-readable local date/time.
 *
 * @param {string} iso - ISO 8601 timestamp.
 * @returns {string}
 */
export function formatTimestamp(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone:  'Asia/Kolkata',
  });
}

/**
 * truncate
 *
 * Truncates a string to `maxLen` characters, appending '…' if needed.
 *
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen = 60) {
  // Guard: coerce non-strings gracefully
  const s = str == null ? '' : String(str);
  return s.length > maxLen ? s.slice(0, maxLen - 1) + '\u2026' : s;
}

// ─ Analytics ──────────────────────────────────────────────────────────────────────────────

/**
 * getStats
 *
 * Analyses all sessions in logs.json and returns a summary object:
 *   - total          : total number of logged sessions
 *   - escalated      : number of sessions that required escalation
 *   - escalationRate : percentage of sessions escalated (string, e.g. "23%")
 *   - topPaths       : the 5 most-common first-choice categories, sorted by frequency
 *   - recentDate     : ISO timestamp of the most recent session
 *
 * @returns {Object|null} Stats object, or null if there are no logs yet.
 */
export function getStats() {
  const logs = readLogs();
  if (logs.length === 0) return null;

  const total     = logs.length;
  const escalated = logs.filter(s => s.escalated).length;
  const rate      = Math.round((escalated / total) * 100);

  // Count how often each top-level category was chosen (first step in path)
  const categoryCounts = {};
  for (const session of logs) {
    if (session.path && session.path.length > 0) {
      const firstChoice = session.path[0].choice;
      categoryCounts[firstChoice] = (categoryCounts[firstChoice] || 0) + 1;
    }
  }

  // Sort by frequency descending and take top 5
  const topPaths = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  // Most recent session timestamp
  const recentDate = logs[logs.length - 1]?.timestamp ?? null;

  return { total, escalated, escalationRate: `${rate}%`, topPaths, recentDate };
}

// ─── Log Management ─────────────────────────────────────────────────────────────────

/**
 * clearLogs
 *
 * Wipes all sessions from logs.json by writing an empty array.
 * Use with caution — this is irreversible.
 *
 * @returns {boolean} true if successful, false on write error.
 */
export function clearLogs() {
  try {
    fs.writeFileSync(LOGS_PATH, '[]', 'utf-8');
    return true;
  } catch {
    return false;
  }
}
