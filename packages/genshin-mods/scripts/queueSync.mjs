// The pulse's queue sync, run at each turn's end: runs `pnpm ai:queue:push` in the repository, appending its output to the
// Sync log and printing its last line, which a failed sync's toast shows. The push takes its own lock, so a turn ending
// While one runs only queues one more. It does nothing outside the repository. The paths mirror the repository's scripts
// Package, which a plugin cannot import
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// oxlint-disable-next-line naming/no-site-name-literal -- the pulse is a plugin script shipped without @esposter/shared, so the folder is written out
const QUEUE_DIRECTORY = join(homedir(), ".esposter", "queue");
const LOG_PATH = join(QUEUE_DIRECTORY, "sync.log");
const PUSH_SCRIPT = join("scripts", "src", "queue", "push", "index.ts");

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

// oxlint-disable-next-line no-restricted-properties -- the hook passes the repository root as its one argument, and a plugin ships without citty
const [repositoryRoot] = process.argv.slice(2);
if (repositoryRoot !== undefined && existsSync(join(repositoryRoot, PUSH_SCRIPT))) {
  mkdirSync(QUEUE_DIRECTORY, { recursive: true });
  appendFileSync(LOG_PATH, `${new Date().toISOString()} pnpm ai:queue:push\n`);
  const { exitCode, lastLine } = await runPush(repositoryRoot);
  console.log(lastLine === "" ? `exited with code ${exitCode}` : lastLine);
  process.exitCode = exitCode;
}
