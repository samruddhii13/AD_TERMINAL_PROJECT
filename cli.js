/**
 * cli.js  (v1.1.0 — added Stats and FAQ viewers)
 * cli.js
 *
 * Core CLI interaction engine for the Contact Center KMT.
 *
 * Responsibilities:
 *  - Rendering the startup banner and main menu
 *  - Traversing the decision tree interactively (with "Go Back" support)
 *  - Displaying the final resolution in a styled card
 *  - Handling the "Search" mode
 *  - Displaying the usage logs viewer
 */

import inquirer  from 'inquirer';
import chalk     from 'chalk';
import figlet    from 'figlet';
import { faqs } from './data/faqs.js';
import { tree }  from './data/tree.js';

import { logSession, readLogs, searchTree, formatTimestamp, truncate, getStats } from './utils.js';


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS / STYLES
// ─────────────────────────────────────────────────────────────────────────────

/** A divider line that fits neatly in an 80-col terminal */
const DIVIDER   = chalk.gray('─'.repeat(70));
const THIN_DIV  = chalk.gray('·'.repeat(70));

// ─────────────────────────────────────────────────────────────────────────────
// BANNER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * showBanner
 *
 * Renders the ASCII art header and a short subtitle using figlet + chalk.
 * Called once at application startup.
 */
export function showBanner() {
  console.clear();
  // figlet renders "KMT" in a large ASCII font
  const art = figlet.textSync('KM  TOOL', {
    font:             'ANSI Shadow',
    horizontalLayout: 'default',
  });

  console.log(chalk.hex('#7C3AED')(art));  // purple gradient feel
  console.log(
    chalk.hex('#A78BFA').bold('  Contact Center  ') +
    chalk.white('Knowledge Management Tool') +
    chalk.gray('  v1.0')
  );
  console.log(
    chalk.gray('  Walk agents through the right resolution — every time.\n')
  );
  console.log(DIVIDER + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MENU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * showMainMenu
 *
 * Presents the top-level menu and routes to the appropriate sub-flow.
 * Loops until the user chooses "Exit".
 */
export async function showMainMenu() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type:    'list',
        name:    'action',
        message: chalk.cyan.bold('What would you like to do?'),
        prefix:  chalk.hex('#7C3AED')('❯'),
        choices: [
          { name: chalk.green('🔍  Start New Query'),    value: 'query'  },
          { name: chalk.yellow('🔎  Search by Keyword'), value: 'search' },
          { name: chalk.blue('📋  View Usage Logs'),     value: 'logs'   },
          { name: chalk.magenta('📊  View Stats'),        value: 'stats'  },
          { name: chalk.cyan('📖  Quick FAQs'),          value: 'faqs'   },
          { name: chalk.red('🚪  Exit'),                 value: 'exit'   },
        ],
      },
    ]);

    switch (action) {
      case 'query':
        await runTraversal(tree, [], []);
        break;
      case 'search':
        await runSearch();
        break;
      case 'logs':
        await viewLogs();
        break;
      case 'stats':
        await viewStats();
        break;
      case 'faqs':
        await viewFaqs();
        break;
      case 'exit':
        console.log('\n' + chalk.hex('#A78BFA')('  Goodbye! Stay helpful. 👋\n'));
        process.exit(0);
    }

    // After each flow, pause before re-showing the menu
    await pressEnterToContinue();
    showBanner();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DECISION TREE TRAVERSAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runTraversal
 *
 * Recursively walks the decision tree, showing a question + selectable
 * options at each step.  Handles:
 *   - Normal navigation (choosing an option moves to the child node)
 *   - "Go Back" (pops the history stack and re-renders the parent)
 *   - Leaf detection (shows the resolution card when reached)
 *
 * @param {Object}   node        - The current tree node being displayed.
 * @param {Array}    history     - Stack of ancestor nodes (for "Go Back").
 * @param {Array}    sessionPath - Accumulated [{question, choice}] for logging.
 */
async function runTraversal(node, history, sessionPath) {

  // ── LEAF NODE reached ──────────────────────────────────────────────────────
  if (node.resolution !== undefined) {
    showResolution(node, sessionPath);
    const sessionId = logSession(sessionPath, node);
    console.log(chalk.gray(`\n  Session logged → ID: ${sessionId}`));
    return;
  }

  // ── QUESTION NODE ──────────────────────────────────────────────────────────
  console.log('\n' + DIVIDER);
  console.log(chalk.hex('#A78BFA').bold(`\n  ❓  ${node.question}\n`));

  // Build the inquirer choices from the node's options
  const optionKeys = Object.keys(node.options);
  const choices = optionKeys.map(label => ({
    name:  chalk.white(label),
    value: label,
  }));

  // Append navigation helpers
  choices.push(new inquirer.Separator(THIN_DIV));
  if (history.length > 0) {
    choices.push({ name: chalk.gray('⬅   Go Back'),           value: '__back__'    });
  }
  choices.push(  { name: chalk.gray('🏠  Back to Main Menu'), value: '__mainmenu__' });

  const { chosen } = await inquirer.prompt([
    {
      type:    'list',
      name:    'chosen',
      message: chalk.cyan('Select an option:'),
      prefix:  chalk.hex('#7C3AED')('❯'),
      choices,
      pageSize: 12,
    },
  ]);

  // ── Handle navigation choices ──────────────────────────────────────────────
  if (chosen === '__back__') {
    // Pop the last history entry and re-render that node
    const { node: parentNode, sessionPath: parentPath } = history.pop();
    await runTraversal(parentNode, history, parentPath);
    return;
  }

  if (chosen === '__mainmenu__') {
    return; // Unwinds the call stack back up to showMainMenu's loop
  }

  // ── Normal traversal ───────────────────────────────────────────────────────
  // Save current state to history before descending
  history.push({ node, sessionPath: [...sessionPath] });

  // Record this step in the session log path
  const updatedPath = [
    ...sessionPath,
    { question: node.question, choice: chosen },
  ];

  // Recurse into the chosen child node
  await runTraversal(node.options[chosen], history, updatedPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLUTION DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * showResolution
 *
 * Renders the final resolution card in the terminal.
 * - Green box for normal resolutions
 * - Yellow warning box if escalation is required
 * - Numbered list of action steps
 * - Breadcrumb path showing how the agent got here
 *
 * @param {{ resolution: string, escalate: boolean, steps: string[] }} leaf
 * @param {Array<{question: string, choice: string}>} sessionPath
 */
function showResolution(leaf, sessionPath) {
  console.log('\n' + DIVIDER);

  // ── Escalation badge ────────────────────────────────────────────────────────
  if (leaf.escalate) {
    console.log(
      '\n  ' +
      chalk.bgYellow.black.bold(' ⚠  ESCALATION REQUIRED ') +
      '  ' +
      chalk.yellow('This case must be handed to a specialist team.')
    );
  } else {
    console.log(
      '\n  ' +
      chalk.bgGreen.black.bold(' ✔  RESOLUTION FOUND ') +
      '  ' +
      chalk.green('You can resolve this case directly.')
    );
  }

  // ── Resolution summary ──────────────────────────────────────────────────────
  console.log('\n' + DIVIDER);
  const resColor = leaf.escalate ? chalk.yellow.bold : chalk.green.bold;
  console.log('\n  ' + chalk.white.underline('Resolution:'));
  console.log('  ' + resColor(leaf.resolution));

  // ── Step-by-step actions ────────────────────────────────────────────────────
  if (leaf.steps && leaf.steps.length > 0) {
    console.log('\n  ' + chalk.white.underline('Action Steps:'));
    leaf.steps.forEach((step, idx) => {
      const stepNum  = chalk.hex('#7C3AED').bold(`  ${idx + 1}.`);
      const stepText = chalk.white(step);
      console.log(`${stepNum} ${stepText}`);
    });
  }

  // ── Breadcrumb path ─────────────────────────────────────────────────────────
  if (sessionPath.length > 0) {
    console.log('\n  ' + chalk.white.underline('Path taken:'));
    sessionPath.forEach(({ question, choice }) => {
      console.log(
        chalk.gray(`    Q: ${truncate(question, 55)}`) + '\n' +
        chalk.hex('#A78BFA')(`    ↳ ${choice}`)
      );
    });
  }

  console.log('\n' + DIVIDER + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD SEARCH MODE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * runSearch
 *
 * Allows the agent to type a keyword (e.g. "refund", "OTP", "locked")
 * and jump directly to the most relevant branch of the tree, bypassing
 * the root-level category selection.
 */
async function runSearch() {
  console.log('\n' + DIVIDER);
  console.log(chalk.hex('#A78BFA').bold('\n  🔎  Keyword Search Mode\n'));

  // ── Get the keyword from the agent ─────────────────────────────────────────
  const { keyword } = await inquirer.prompt([
    {
      type:    'input',
      name:    'keyword',
      message: chalk.cyan('Enter a keyword to search for:'),
      prefix:  chalk.hex('#7C3AED')('❯'),
      validate: (input) => input.trim().length >= 2
        ? true
        : 'Please enter at least 2 characters.',
    },
  ]);

  // ── Run the search ──────────────────────────────────────────────────────────
  const results = searchTree(tree, keyword.trim());

  if (results.length === 0) {
    console.log(chalk.yellow('\n  No matches found. Try a different keyword.\n'));
    return;
  }

  console.log(chalk.green(`\n  Found ${results.length} matching branch(es):\n`));

  // ── Let agent pick which result to jump to ──────────────────────────────────
  const choices = results.map((r, i) => ({
    name:  `${chalk.hex('#7C3AED').bold(`[${i + 1}]`)} ${chalk.white(truncate(r.label, 65))}`,
    value: i,
  }));
  choices.push(new inquirer.Separator(THIN_DIV));
  choices.push({ name: chalk.gray('← Back to Main Menu'), value: '__back__' });

  const { picked } = await inquirer.prompt([
    {
      type:    'list',
      name:    'picked',
      message: chalk.cyan('Select a branch to jump to:'),
      prefix:  chalk.hex('#7C3AED')('❯'),
      choices,
      pageSize: 10,
    },
  ]);

  if (picked === '__back__') return;

  // ── Traverse from the selected node ────────────────────────────────────────
  const selectedResult = results[picked];

  // Build a synthetic session path based on the search path
  const prePath = selectedResult.path.map((label, i) => ({
    question: `[Search jump: step ${i + 1}]`,
    choice:   label,
  }));

  await runTraversal(selectedResult.node, [], prePath);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGS VIEWER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * viewLogs
 *
 * Reads sessions from logs.json and displays them in a paginated,
 * colour-coded summary table.  Each log entry shows:
 *   - Session ID and timestamp
 *   - The path of choices made
 *   - The final resolution and escalation status
 */
async function viewLogs() {
  console.log('\n' + DIVIDER);
  console.log(chalk.hex('#A78BFA').bold('\n  📋  Usage Logs\n'));

  const logs = readLogs();

  if (logs.length === 0) {
    console.log(chalk.yellow('  No sessions logged yet. Run a query first!\n'));
    return;
  }

  console.log(chalk.white(`  Total sessions logged: ${chalk.green.bold(logs.length)}\n`));

  // Display each session (most recent first)
  const reversed = [...logs].reverse();

  // Show only the last 15 sessions to avoid flooding the terminal
  const toShow = reversed.slice(0, 15);

  toShow.forEach((session, idx) => {
    const escalatedBadge = session.escalated
      ? chalk.bgYellow.black(' ESCALATED ')
      : chalk.bgGreen.black('  RESOLVED ');

    console.log(
      chalk.gray(`  [${ String(idx + 1).padStart(2, '0') }]`) +
      ' ' + escalatedBadge +
      chalk.gray('  ' + formatTimestamp(session.timestamp)) +
      chalk.dim('  ' + session.id)
    );

    // Show the path breadcrumb
    if (session.path && session.path.length > 0) {
      const crumb = session.path.map(p => p.choice).join(chalk.gray(' → '));
      console.log(chalk.dim('       ↳ ') + crumb);
    }

    // Show resolution (truncated)
    console.log(
      chalk.dim('       📝 ') +
      chalk.white(truncate(session.resolution, 60))
    );

    console.log('');
  });

  if (logs.length > 15) {
    console.log(chalk.gray(`  … and ${logs.length - 15} older session(s). See logs.json for full history.\n`));
  }

  console.log(DIVIDER + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS VIEWER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * viewStats
 *
 * Displays an analytics summary of all logged sessions:
 *   - Total sessions handled
 *   - Number and percentage escalated
 *   - Top 5 most-queried categories (based on first choice in each session)
 *   - Timestamp of the most recent session
 */
async function viewStats() {
  console.log('\n' + DIVIDER);
  console.log(chalk.hex('#A78BFA').bold('\n  📊  Usage Statistics\n'));

  const stats = getStats();

  if (!stats) {
    console.log(chalk.yellow('  No sessions logged yet. Run a query first!\n'));
    return;
  }

  // ── Summary row ────────────────────────────────────────────────────────────
  console.log(
    chalk.white('  Total sessions   : ') + chalk.green.bold(stats.total)
  );
  console.log(
    chalk.white('  Escalated        : ') +
    chalk.yellow.bold(stats.escalated) +
    chalk.gray(` (${stats.escalationRate})`)
  );
  console.log(
    chalk.white('  Resolved in-call : ') +
    chalk.green.bold(stats.total - stats.escalated)
  );
  if (stats.recentDate) {
    console.log(
      chalk.white('  Last session     : ') +
      chalk.gray(formatTimestamp(stats.recentDate))
    );
  }

  // ── Top categories ─────────────────────────────────────────────────────────
  if (stats.topPaths.length > 0) {
    console.log('\n  ' + chalk.white.underline('Top queried categories:'));
    stats.topPaths.forEach(({ label, count }, i) => {
      const bar   = chalk.hex('#7C3AED')('█'.repeat(count));
      const rank  = chalk.gray(`  ${i + 1}.`);
      const name  = chalk.white(truncate(label, 35).padEnd(36));
      const cnt   = chalk.green.bold(`${count} session${count !== 1 ? 's' : ''}`);
      console.log(`${rank} ${name}  ${bar}  ${cnt}`);
    });
  }

  console.log('\n' + DIVIDER + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ VIEWER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * viewFaqs
 *
 * Displays the quick-reference FAQ list.  The agent can browse all FAQs
 * or type a keyword to filter them.
 */
async function viewFaqs() {
  console.log('\n' + DIVIDER);
  console.log(chalk.hex('#A78BFA').bold('\n  📖  Quick Reference FAQs\n'));

  // Ask if the agent wants to filter or see all
  const { mode } = await inquirer.prompt([
    {
      type:    'list',
      name:    'mode',
      message: chalk.cyan('How would you like to browse FAQs?'),
      prefix:  chalk.hex('#7C3AED')('❯'),
      choices: [
        { name: chalk.white('Show all FAQs'),         value: 'all'    },
        { name: chalk.white('Filter by keyword'),     value: 'filter' },
        { name: chalk.gray('← Back to Main Menu'),    value: 'back'   },
      ],
    },
  ]);

  if (mode === 'back') return;

  let filtered = faqs;

  if (mode === 'filter') {
    const { kw } = await inquirer.prompt([
      {
        type:    'input',
        name:    'kw',
        message: chalk.cyan('Enter keyword:'),
        prefix:  chalk.hex('#7C3AED')('❯'),
        validate: i => i.trim().length >= 2 ? true : 'At least 2 characters required.',
      },
    ]);
    const term = kw.trim().toLowerCase();
    filtered = faqs.filter(f =>
      f.question.toLowerCase().includes(term) ||
      f.answer.toLowerCase().includes(term)   ||
      f.tags.some(t => t.includes(term))
    );
  }

  if (filtered.length === 0) {
    console.log(chalk.yellow('\n  No FAQs matched that keyword.\n'));
    return;
  }

  console.log('');
  filtered.forEach((faq, idx) => {
    console.log(
      chalk.hex('#7C3AED').bold(`  [${String(idx + 1).padStart(2, '0')}]  `) +
      chalk.white.bold(faq.question)
    );
    console.log(chalk.green('        ' + faq.answer));
    if (faq.tip) {
      console.log(chalk.yellow('        💡 Tip: ') + chalk.dim(faq.tip));
    }
    console.log('');
  });

  console.log(DIVIDER + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * pressEnterToContinue
 *
 * A simple "press Enter to return to menu" pause, so the agent can
 * read the output before the screen is cleared.
 */
async function pressEnterToContinue() {
  await inquirer.prompt([
    {
      type:    'input',
      name:    '_',
      message: chalk.gray('Press Enter to return to the main menu…'),
      prefix:  '',
    },
  ]);
}
