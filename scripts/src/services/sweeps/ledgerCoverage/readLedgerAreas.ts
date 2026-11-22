import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// The areas of the area list, each named by its file. An area groups the cells of every question, so a trailer naming
// `<question>/<area>` is about the question alone
export const readLedgerAreas = (): string[] =>
  readdirSync(join(REPOSITORY_ROOT, LEDGER_AREA_DIRECTORY))
    .filter((filename) => filename.endsWith(".md") && filename !== "README.md")
    .map((filename) => filename.slice(0, -".md".length));
