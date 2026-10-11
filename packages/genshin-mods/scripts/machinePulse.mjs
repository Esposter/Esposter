// The pulse's read of the machine watcher: prints its latest reading as JSON, and starts the watcher when the reading is
// Missing, older than the stale line or written by a process that has exited. It prints nothing and exits 0 outside the
// Repository, where the watcher's script does not exist. The stale line and the state path mirror the repository's
// Scripts package, which a plugin cannot import
import { spawn } from "node:child_process";
import { closeSync, existsSync, mkdirSync, openSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MACHINE_STATE_STALE_MS = 3 * 60 * 1000;
const MACHINE_DIRECTORY = join(homedir(), ".esposter", "machine");
const STATE_PATH = join(MACHINE_DIRECTORY, "state.json");
const LOG_PATH = join(MACHINE_DIRECTORY, "watch.log");
const WATCHER_SCRIPT = join("scripts", "src", "machine", "watch", "index.ts");

const isProcessRunning = (processId) => {
  try {
    process.kill(processId, 0);
    return true;
  } catch {
    return false;
  }
};

const startWatcher = (repositoryRoot) => {
  mkdirSync(MACHINE_DIRECTORY, { recursive: true });
  const logDescriptor = openSync(LOG_PATH, "a");
  // The shell is what resolves pnpm on Windows, where it is a command script. Its output goes to the log, so nothing
  // Holds the pipe this run reads, and the watcher outlives this run
  const child = spawn("pnpm ai:machine:watch", {
    cwd: repositoryRoot,
    detached: true,
    shell: true,
    stdio: ["ignore", logDescriptor, logDescriptor],
    windowsHide: true,
  });
  child.on("error", () => undefined);
  child.unref();
  closeSync(logDescriptor);
};

const [repositoryRoot] = process.argv.slice(2);
if (repositoryRoot !== undefined && existsSync(join(repositoryRoot, WATCHER_SCRIPT))) {
  const state = existsSync(STATE_PATH) ? JSON.parse(readFileSync(STATE_PATH, "utf8")) : undefined;
  const isStale = state === undefined || Date.now() - Date.parse(state.at) >= MACHINE_STATE_STALE_MS;
  if (isStale || !isProcessRunning(state.processId)) startWatcher(repositoryRoot);
  if (state !== undefined) process.stdout.write(JSON.stringify(state));
}
