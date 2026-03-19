/**
 * Kill any process on port 4000, then run the Next.js dev server and report if it becomes ready within 90 seconds.
 * Usage: node scripts/check-dev-start.js
 * Run from trace-dashboard directory.
 */

const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const CWD = path.resolve(__dirname, "..");
const TIMEOUT_MS = 90 * 1000;
const PORT = 4000;

require("./kill-port.js");

setTimeout(() => {
const child = spawn("npx", ["next", "dev", "--turbo", "-p", String(PORT)], {
  cwd: CWD,
  shell: true,
  stdio: ["ignore", "pipe", "pipe"],
});

let resolved = false;
const start = Date.now();

function finish(success, message) {
  if (resolved) return;
  resolved = true;
  child.kill("SIGTERM");
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log("");
  console.log(message);
  console.log(`(Elapsed: ${elapsed}s)`);
  process.exit(success ? 0 : 1);
}

const timeout = setTimeout(() => {
  finish(false, "FAIL: Dev server did not become ready within 90 seconds.");
}, TIMEOUT_MS);

let serverListening = false;
function maybeTriggerRequest() {
  if (!serverListening) return;
  const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
    clearTimeout(timeout);
    finish(true, "OK: Dev server responded to HTTP request within the time limit.");
  });
  req.on("error", () => {});
  req.setTimeout(5000, () => req.destroy());
}

function onData(chunk, isStderr) {
  const text = chunk.toString();
  const out = isStderr ? process.stderr : process.stdout;
  out.write(text);
  if (/Local:\s*http:\/\//i.test(text)) {
    serverListening = true;
    setTimeout(maybeTriggerRequest, 2000);
  }
  if (!/Failed|Error:|EADDRINUSE/i.test(text) && /Ready in \d|compiled successfully|✓ Compiled|✓ Ready/i.test(text)) {
    clearTimeout(timeout);
    finish(true, "OK: Dev server started within the time limit.");
  }
}

child.stdout.on("data", (c) => onData(c, false));
child.stderr.on("data", (c) => onData(c, true));
child.on("error", (err) => {
  clearTimeout(timeout);
  finish(false, "FAIL: " + err.message);
});
child.on("exit", (code, signal) => {
  if (!resolved) {
    clearTimeout(timeout);
    finish(false, `Process exited (code=${code}, signal=${signal}) before ready.`);
  }
});

console.log(`Starting dev server on port ${PORT} (with Turbopack); will wait up to ${TIMEOUT_MS / 1000}s...`);
console.log("");
}, 800);
