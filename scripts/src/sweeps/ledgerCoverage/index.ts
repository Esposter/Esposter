import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { AGENT_DIRECTORY } from "@esposter/configuration";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LEDGER_DIRECTORY = `${AGENT_DIRECTORY}/ledgers/`;

// Oldest first so a later trailer wins, ordered and dated by author date so a rebase moves neither — the default
// Traversal is committer-dated, which replays a rebased pass after the reopen that was meant to undo it — and only
// The commits carrying a trailer at all: git matches `--grep` per line, so the anchor holds it to the block's shape
const log = execFileSync(
  "git",
  [
    "log",
    "--reverse",
    "--author-date-order",
    "--format=%as%x1F%B%x1E",
    ...Object.values(LedgerEventType).map((type) => `--grep=^${type}: `),
  ],
  { cwd: REPOSITORY_ROOT, encoding: "utf8", env: getGitEnv(), maxBuffer: 1 << 28 },
);
const events = getLedgerEvents(log);

for (const ledgerPath of getSweepFilePaths(`${LEDGER_DIRECTORY}*.md`).filter((path) => !path.endsWith("README.md"))) {
  const ledger = ledgerPath.slice(LEDGER_DIRECTORY.length, -".md".length);
  const absolutePath = resolve(REPOSITORY_ROOT, ledgerPath);
  const text = readFileSync(absolutePath, "utf8");
  const { text: rewritten, unmatched } = applyLedgerEvents(text, ledger, events);
  for (const { date, unit } of unmatched) console.info(`unmatched ${ledgerPath}: ${unit ?? ""} (${date})`);
  if (rewritten === text) continue;

  writeFileSync(absolutePath, rewritten);
  console.info(ledgerPath);
}
