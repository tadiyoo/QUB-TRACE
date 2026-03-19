/**
 * Kill any process on port 4000, then start Next.js dev server on 4000.
 * Usage: node scripts/dev.js
 * So "npm run dev" always uses port 4000 after cleaning it.
 */

const { spawn } = require("child_process");
const path = require("path");

const CWD = path.resolve(__dirname, "..");
const PORT = 4000;

require("./kill-port.js");
setTimeout(() => {
  const child = spawn("npx", ["next", "dev", "--turbo", "-p", String(PORT)], {
  cwd: CWD,
  shell: true,
  stdio: "inherit",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}, 800);
