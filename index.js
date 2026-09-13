/**
 * index.js
 *
 * Entry point for the Contact Center Knowledge Management Tool (KMT).
 *
 * Run with:  node index.js
 *
 * This file simply imports the banner and menu from cli.js and starts
 * the application.  All logic is in cli.js, tree data in data/tree.js,
 * and helper utilities in utils.js.
 *
 * Exit codes:
 *   0  — clean exit (user chose Exit)
 *   1  — unhandled fatal error
 */

import { showBanner, showMainMenu } from './cli.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function main() {
  showBanner();       // Render the ASCII art header
  await showMainMenu(); // Enter the interactive main menu loop
}

main().catch((err) => {
  // Graceful error handling at the top level
  console.error('\n  \u274c  Fatal error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  process.exit(1);
});
