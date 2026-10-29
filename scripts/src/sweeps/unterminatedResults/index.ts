import { REPOSITORY_ROOT, VUE_SCRIPT_BODY_REGEX } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { checkIsInScope } from "#src/services/sweeps/unterminatedResults/checkIsInScope";
import { getUnterminatedResults } from "#src/services/sweeps/unterminatedResults/getUnterminatedResults";
import { timeCommand } from "#src/services/timing/timeCommand";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

timeCommand("ai:sweep:unterminated-results");

const NOT_LINE_BREAK_REGEX = /[^\n]/gu;
// A `.vue` file is markup around its `<script>` bodies, which the TypeScript parser cannot read. Everything outside
// A body is blanked and every line break kept, so a call's offset and line are still the file's own
const maskOutsideScript = (text: string): string => {
  let masked = "";
  let cursor = 0;
  for (const match of text.matchAll(VUE_SCRIPT_BODY_REGEX)) {
    masked += text.slice(cursor, match.index).replaceAll(NOT_LINE_BREAK_REGEX, " ") + match[0];
    cursor = match.index + match[0].length;
  }
  return masked + text.slice(cursor).replaceAll(NOT_LINE_BREAK_REGEX, " ");
};

// Prints rather than exits non-zero, like the other sweep scans: a hit is a chain to read against what the
// Enclosing function does with it, and the ledger carries the standing exclusions
// (`.agents/ledgers/error-handling.md`).
for (const path of readSweepFilePaths("*.ts", "*.vue").filter((filePath) => checkIsInScope(filePath))) {
  const text = readFileSync(resolve(REPOSITORY_ROOT, path), "utf8");
  const scannedText = path.endsWith(".vue") ? maskOutsideScript(text) : text;
  for (const { after, line } of getUnterminatedResults(scannedText)) console.info(`${path}:${line}  after: ${after}`);
}
