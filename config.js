/**
 * config.js
 *
 * Central configuration for the Contact Center KMT.
 * Tweak these values to change app-wide behaviour without
 * digging through logic files.
 */

export const config = {
  // ── App identity ────────────────────────────────────────────────────────────
  appName:    'Contact Center KMT',
  version:    '1.1.0',

  // ── Logs ────────────────────────────────────────────────────────────────────
  logsFile:       'logs.json',   // path relative to project root
  maxLogsDisplay: 15,            // max sessions shown in the log viewer

  // ── UI ──────────────────────────────────────────────────────────────────────
  pageSize:       12,            // max items visible in inquirer list before scrolling
  dividerChar:    '─',
  dividerWidth:   70,

  // ── Colour palette (hex codes used by chalk) ────────────────────────────────
  colors: {
    primary:    '#7C3AED',  // purple  — brand / accents
    secondary:  '#A78BFA',  // violet  — headings
    success:    '#22C55E',  // green   — resolved
    warning:    '#EAB308',  // yellow  — escalation
    muted:      '#6B7280',  // gray    — dividers / hints
    info:       '#38BDF8',  // sky     — prompts
  },

  // ── Search ──────────────────────────────────────────────────────────────────
  minSearchLength: 2,       // minimum characters required for a keyword search
};
