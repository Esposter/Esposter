import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { PARITY_PASSES_PATH } from "#src/services/genshinParity/passes/constants";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

const HEADER = [
  "# Parity passes",
  "",
  "Each component's last `pnpm -C scripts genshin:parity passes <component>`, which rewrites its own section: every",
  "pass in order up to the first whose gate fails or that has no measure yet, which is the next work. Commit it with",
  "the change that moved it, as a bench's report is committed.",
];
const SECTION_PREFIX = "## ";
const formatValue = (value: number): string => (Number.isInteger(value) ? String(value) : value.toFixed(4));
const toSection = (component: DerivedAssetComponent, results: readonly ParityPassResult[]): string =>
  [
    `${SECTION_PREFIX}${component}`,
    "",
    "| Pass | Reading | Value | Gate | Unit | Held |",
    "| :--- | :------ | ----: | ---: | :--- | :--- |",
    ...results.flatMap(({ measure: { notes, readings }, pass }) =>
      readings.length === 0
        ? [`| ${pass} | ${notes.join("; ")} | | | | no |`]
        : readings.map(
            ({ gate, name, unit, value }) =>
              `| ${pass} | ${name} | ${formatValue(value)} | ${formatValue(gate)} | ${unit} | ${value <= gate ? "yes" : "no"} |`,
          ),
    ),
  ].join("\n");
// The committed report of the passes, one section a component, the given one rewritten and the rest kept as they were
// Last run, in the components' order
export const writeParityPasses = async (
  component: DerivedAssetComponent,
  results: readonly ParityPassResult[],
): Promise<void> => {
  const text = existsSync(PARITY_PASSES_PATH) ? await readFile(PARITY_PASSES_PATH, "utf8") : "";
  // Each section by the component its heading names, the given one's last
  const componentSectionMap = new Map([
    ...text
      .split(`\n${SECTION_PREFIX}`)
      .slice(1)
      .map((section) => [section.slice(0, section.indexOf("\n")), `${SECTION_PREFIX}${section.trimEnd()}`] as const),
    [component, toSection(component, results)] as const,
  ]);
  const sections = Object.values(DerivedAssetComponent).flatMap((key) => {
    const section = componentSectionMap.get(key);
    return section ? [section] : [];
  });
  await writeFile(PARITY_PASSES_PATH, `${[HEADER.join("\n"), ...sections].join("\n\n")}\n`);
};
