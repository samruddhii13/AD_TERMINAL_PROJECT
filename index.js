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
 */

import { showBanner, showMainMenu } from './cli.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function main() {
  showBanner();       // Render the ASCII art header
  await showMainMenu(); // Enter the interactive main menu loop
}

main().catch((err) => {
  // Graceful error handling at the top level
  console.error('\n  Fatal error:', err.message);
  process.exit(1);
});
