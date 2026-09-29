import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { renameSource } from "#src/services/identifiers/rename/renameSource";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// Renames every name a rename map holds across the repository's sources, printing each file it rewrote. The map is
// Data written before the run (`RenameMap`), read relative to where the command runs so it can live in a scratchpad;
// The typecheck that follows finds what no map can see
const renameMapPath = process.argv[2];
if (!renameMapPath)
  throw new InvalidOperationError(Operation.Read, "ai:identifiers:rename", "pass the path of a rename map");

const renameMap = parseMachineJson<RenameMap>(
  readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), renameMapPath), "utf8"),
);
for (const path of readSweepFilePaths("*.ts", "*.mts", "*.vue")) {
  const absolutePath = resolve(REPOSITORY_ROOT, path);
  const text = readFileSync(absolutePath, "utf8");
  const isSource = renameMap.sources.some((source) => path.startsWith(`${source}/`));
  const renamedText = renameSource(path, text, renameMap, isSource);
  if (renamedText === text) continue;

  writeFileSync(absolutePath, renamedText);
  console.info(path);
}
