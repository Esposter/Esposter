import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { PARITY_PASS_ORDER, PARITY_PASSES_DIRECTORY } from "#src/services/genshinParity/passes/constants";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";
import { getParityPassesPath } from "#src/services/genshinParity/passes/getParityPassesPath";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const TITLE_PREFIX = "# ";
const TABLE_HEADER = [
  "| Pass | Reading | Value | Gate | Unit | Held |",
  "| :--- | :------ | ----: | ---: | :--- | :--- |",
];
// The heading, the blank line under it and the table's header come before the rows
const ROWS_START = 2 + TABLE_HEADER.length;
const ROW_PREFIX = "| ";
const toRows = ({ measure: { notes, readings }, pass }: ParityPassResult): string[] =>
  readings.length === 0
    ? [`${ROW_PREFIX}${pass} | ${notes.join("; ")} | | | | no |`]
    : readings.map(
        (reading) =>
          `${ROW_PREFIX}${pass} | ${reading.name} | ${formatReadingValue(reading)} | ${formatPassValue(reading.gate)} | ${reading.unit} | ${checkIsReadingHeld(reading) ? "yes" : "no"} |`,
      );
// The committed report of a component's last run of its passes, a file per component: a whole run rewrites it, with
// Every pass in order up to the first that fails or has no measure yet. A pass run alone (`--pass`) rewrites only its
// Own rows and keeps the others in their order; the report is committed with the change that moved it, as a bench is
export const writeParityPasses = async (
  component: DerivedAssetComponent,
  results: readonly ParityPassResult[],
  { isPassAlone = false }: { isPassAlone?: boolean } = {},
): Promise<void> => {
  const passesPath = getParityPassesPath(component);
  const text = existsSync(passesPath) ? await readFile(passesPath, "utf8") : "";
  // The rows the file holds by the pass each names in its first cell, kept for a pass run alone
  const keptPassRowsMap = Map.groupBy(isPassAlone ? text.trimEnd().split("\n").slice(ROWS_START) : [], (row) =>
    row.slice(ROW_PREFIX.length, row.indexOf(" |", ROW_PREFIX.length)),
  );
  const passRowsMap = new Map(results.map((result) => [result.pass, toRows(result)]));
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
