import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { PARITY_PASS_ORDER, PARITY_PASSES_PATH } from "#src/services/genshinParity/passes/constants";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatReadingValue } from "#src/services/genshinParity/passes/formatReadingValue";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const HEADER = [
  "# Parity passes",
  "",
  "Each component's last `pnpm -C scripts genshin:parity passes <component>`, which rewrites its own section: every",
  "pass in order up to the first whose gate fails or that has no measure yet, which is the next work. A pass run alone",
  "(`--pass`) rewrites only its own rows. Commit it with the change that moved it, as a bench's report is committed.",
];
const SECTION_PREFIX = "## ";
const TABLE_HEADER = [
  "| Pass | Reading | Value | Gate | Unit | Held |",
  "| :--- | :------ | ----: | ---: | :--- | :--- |",
];
// A section's heading, the blank line under it and its table's header come before its rows
const SECTION_ROWS_START = 2 + TABLE_HEADER.length;
const ROW_PREFIX = "| ";
const toRows = ({ measure: { notes, readings }, pass }: ParityPassResult): string[] =>
  readings.length === 0
    ? [`${ROW_PREFIX}${pass} | ${notes.join("; ")} | | | | no |`]
    : readings.map(
        (reading) =>
          `${ROW_PREFIX}${pass} | ${reading.name} | ${formatReadingValue(reading)} | ${formatPassValue(reading.gate)} | ${reading.unit} | ${checkIsReadingHeld(reading) ? "yes" : "no"} |`,
      );
// The committed report of the passes, one section a component in the components' order, the rest kept as they were
// Last run: a whole run rewrites the given component's section, and a pass run alone only that pass's rows of it, the
// Others kept and the passes in their order
export const writeParityPasses = async (
  component: DerivedAssetComponent,
  results: readonly ParityPassResult[],
  { isPassAlone = false }: { isPassAlone?: boolean } = {},
): Promise<void> => {
  const text = existsSync(PARITY_PASSES_PATH) ? await readFile(PARITY_PASSES_PATH, "utf8") : "";
  // Each section by the component its heading names
  const componentSectionMap = new Map<string, string>(
    text
      .split(`\n${SECTION_PREFIX}`)
      .slice(1)
      .map((section) => [section.slice(0, section.indexOf("\n")), `${SECTION_PREFIX}${section.trimEnd()}`] as const),
  );
  // The section's last rows by the pass each names in its first cell, kept for a pass run alone
  const keptPassRowsMap = Map.groupBy(
    isPassAlone ? (componentSectionMap.get(component)?.split("\n").slice(SECTION_ROWS_START) ?? []) : [],
    (row) => row.slice(ROW_PREFIX.length, row.indexOf(" |", ROW_PREFIX.length)),
  );
  const passRowsMap = new Map(results.map((result) => [result.pass, toRows(result)]));
  componentSectionMap.set(
    component,
    [
      `${SECTION_PREFIX}${component}`,
      "",
      ...TABLE_HEADER,
      ...PARITY_PASS_ORDER.flatMap((pass) => passRowsMap.get(pass) ?? keptPassRowsMap.get(pass) ?? []),
    ].join("\n"),
  );
  const sections = Object.values(DerivedAssetComponent).flatMap((key) => {
    const section = componentSectionMap.get(key);
    return section ? [section] : [];
  });
  await writeFile(PARITY_PASSES_PATH, `${[HEADER.join("\n"), ...sections].join("\n\n")}\n`);
};
