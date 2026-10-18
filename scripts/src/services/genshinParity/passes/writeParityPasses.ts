import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { PARITY_PASS_ORDER, PARITY_PASSES_DIRECTORY } from "#src/services/genshinParity/passes/constants";
import { getParityPassesPath } from "#src/services/genshinParity/passes/getParityPassesPath";
import { ROW_PREFIX, toParityPassRows } from "#src/services/genshinParity/passes/toParityPassRows";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const TITLE_PREFIX = "# ";
const TABLE_HEADER = [
  "| Pass | Reading | Value | Gate | Unit | Held |",
  "| :--- | :------ | ----: | ---: | :--- | :--- |",
];
// The heading, the blank line under it and the table's header come before the rows
const ROWS_START = 2 + TABLE_HEADER.length;
// The rows the report holds, which a run checks the frozen results it would move against before it rewrites them
export const readParityPassRows = async (component: DerivedAssetComponent): Promise<string[]> => {
  const passesPath = getParityPassesPath(component);
  if (!existsSync(passesPath)) return [];
  return (await readFile(passesPath, "utf8")).trimEnd().split("\n").slice(ROWS_START);
};
// The committed report of a component's last run of its passes, a file per component: a whole run rewrites it, with
// Every pass in order up to the first that fails or has no measure yet. A pass run alone (`--pass`) rewrites only its
// Own rows and keeps the others in their order; the report is committed with the change that moved it, as a bench is
export const writeParityPasses = async (
  component: DerivedAssetComponent,
  results: readonly ParityPassResult[],
  { isPassAlone = false }: { isPassAlone?: boolean } = {},
): Promise<void> => {
  const passesPath = getParityPassesPath(component);
  // The rows the file holds by the pass each names in its first cell, kept for a pass run alone
  const keptPassRowsMap = Map.groupBy(isPassAlone ? await readParityPassRows(component) : [], (row) =>
    row.slice(ROW_PREFIX.length, row.indexOf(" |", ROW_PREFIX.length)),
  );
  const passRowsMap = new Map(results.map((result) => [result.pass, toParityPassRows(result)]));
  await mkdir(PARITY_PASSES_DIRECTORY, { recursive: true });
  await writeFile(
    passesPath,
    `${[
      `${TITLE_PREFIX}${component}`,
      "",
      ...TABLE_HEADER,
      ...PARITY_PASS_ORDER.flatMap((pass) => passRowsMap.get(pass) ?? keptPassRowsMap.get(pass) ?? []),
    ].join("\n")}\n`,
  );
};
