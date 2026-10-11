// The pulse's queue sync: runs `pnpm ai:queue:push` in the repository, appending its output to the sync log and printing
// Its last line, which a failed sync's toast shows. It does nothing outside the repository, and nothing while a previous
// Sync still runs under a live pid in its lock. The paths mirror the repository's scripts package, which a plugin cannot
// Import
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const QUEUE_DIRECTORY = join(homedir(), ".esposter", "queue");
const LOG_PATH = join(QUEUE_DIRECTORY, "sync.log");
const LOCK_PATH = join(QUEUE_DIRECTORY, "sync.lock");
const PUSH_SCRIPT = join("scripts", "src", "queue", "push", "index.ts");

// A pid of 0 or less names a process group, which signalling reads as alive, so only a positive pid counts
const isProcessRunning = (processId) => {
  if (!Number.isInteger(processId) || processId <= 0) return false;
  try {
    process.kill(processId, 0);
    return true;
  } catch {
    return false;
  }
};

const isLocked = () => existsSync(LOCK_PATH) && isProcessRunning(Number(readFileSync(LOCK_PATH, "utf8")));

// Spawned without a shell, as the watcher is, so the push's own exit code is the one read here
const runPush = (repositoryRoot) =>
  new Promise((resolve) => {
    let lastLine = "";
    const readChunk = (chunk) => {
      appendFileSync(LOG_PATH, chunk);
      for (const line of chunk.toString().split("\n")) if (line.trim() !== "") lastLine = line.trim();
    };
    const child = spawn("pnpm", ["ai:queue:push"], {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    child.stdout.on("data", readChunk);
    child.stderr.on("data", readChunk);
    child.on("error", (error) => resolve({ exitCode: 1, lastLine: error.message }));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, lastLine }));
  });

const [repositoryRoot] = process.argv.slice(2);
if (repositoryRoot !== undefined && existsSync(join(repositoryRoot, PUSH_SCRIPT)) && !isLocked()) {
  mkdirSync(QUEUE_DIRECTORY, { recursive: true });
  appendFileSync(LOG_PATH, `${new Date().toISOString()} pnpm ai:queue:push\n`);
  writeFileSync(LOCK_PATH, String(process.pid));
  try {
    const { exitCode, lastLine } = await runPush(repositoryRoot);
    console.log(lastLine === "" ? `exited with code ${exitCode}` : lastLine);
    process.exitCode = exitCode;
  } finally {
    rmSync(LOCK_PATH, { force: true });
  }
}
