/**
 * Kill any process listening on the given port.
 * Usage: node scripts/kill-port.js [port]
 * Default port: 4000
 * Works on Windows (netstat + taskkill) and Unix/macOS (lsof + kill).
 */

const { execSync } = require("child_process");
const port = parseInt(process.argv[2] || "4000", 10) || 4000;

const isWindows = process.platform === "win32";

function killPort() {
  if (isWindows) {
    let out = "";
    try {
      out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    } catch (e) {
      if (e.status === 1) return;
      throw e;
    }
    const lines = out.trim().split(/\r?\n/).filter((line) => line.includes("LISTENING"));
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (/^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Killed process ${pid} on port ${port}`);
      } catch (_) {}
    }
  } else {
    try {
      const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`Killed process ${pid} on port ${port}`);
        } catch (_) {}
      }
    } catch (e) {
      if (e.status === 1) return;
      throw e;
    }
  }
}

killPort();
