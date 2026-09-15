import { LedgerEventType } from "#src/models/sweeps/ledgerCoverage/LedgerEventType";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getGitEnv } from "#src/services/shared/getGitEnv";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { applyLedgerEvents } from "#src/services/sweeps/ledgerCoverage/applyLedgerEvents";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/sweeps/ledgerCoverage/constants";
import { getLedgerEvents } from "#src/services/sweeps/ledgerCoverage/getLedgerEvents";
import { AGENT_DIRECTORY } from "@esposter/configuration";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LEDGER_DIRECTORY = `${AGENT_DIRECTORY}/ledgers/`;

// Oldest first so a later trailer wins, author-dated so a rebase moves nothing, and only the commits carrying a
// Trailer at all — git matches `--grep` per line, so the anchor holds it to the trailer block's shape
const log = execFileSync(
  "git",
  [
    "log",
    "--reverse",
    `--format=%as${FIELD_SEPARATOR}%B${RECORD_SEPARATOR}`,
    ...Object.values(LedgerEventType).map((type) => `--grep=^${type}: `),
  ],
  { cwd: REPOSITORY_ROOT, encoding: "utf8", env: getGitEnv(), maxBuffer: 1 << 28 },
);
const events = getLedgerEvents(log);

for (const path of getSweepFilePaths(`${LEDGER_DIRECTORY}*.md`).filter((path) => !path.endsWith("README.md"))) {
  const ledger = path.slice(LEDGER_DIRECTORY.length, -".md".length);
  const absolutePath = resolve(REPOSITORY_ROOT, path);
  const text = readFileSync(absolutePath, "utf8");
  const { text: rewritten, unmatched } = applyLedgerEvents(text, ledger, events);
  for (const { date, unit } of unmatched) console.info(`unmatched ${path}: ${unit ?? ""} (${date})`);
  if (rewritten === text) continue;

  writeFileSync(absolutePath, rewritten);
  console.info(path);
}
