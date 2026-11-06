import type { GenshinExitCheck } from "#src/models/genshinProgress/GenshinExitCheck";

import { GenshinExitCheckState } from "#src/models/genshinProgress/GenshinExitCheckState";
import { PARITY_PASS_ORDER } from "#src/services/genshinParity/passes/constants";
import { GENSHIN_OPTIONAL_PASSES } from "#src/services/genshinProgress/constants";

// A row of a component's passes report, one for each reading: its pass, and whether the reading holds its gate
const PASS_ROW_REGEX = /^\| (?<pass>[A-Za-z]+) \| .* \| (?<held>yes|no) \|$/gmu;

// A region's passes are frozen when every pass in the run's order holds on every reading. A pass with a reading that does
// Not hold fails, as does one with no row unless its scene may not owe it. A missing optional pass leaves the check not
// Measurable, since the report does not say whether it was owed. A region with no passes component (undefined) is not
// Measurable either, as nothing was ever run for it
export const checkRegionPassesFrozen = (folder: string, report: string | undefined): GenshinExitCheck => {
  const name = `region ${folder}: passes frozen`;
  if (report === undefined)
    return { name, notes: ["its folder names no passes component"], state: GenshinExitCheckState.NotMeasurable };
  const rows = Array.from(report.matchAll(PASS_ROW_REGEX), ({ groups }) => ({
    isHeld: groups?.held === "yes",
    pass: groups?.pass ?? "",
  }));
  const failing: string[] = [];
  const unrecorded: string[] = [];
  for (const pass of PARITY_PASS_ORDER) {
    const passRows = rows.filter((row) => row.pass === pass);
    if (passRows.some(({ isHeld }) => !isHeld)) failing.push(`${pass} has a reading that does not hold`);
    else if (passRows.length === 0 && GENSHIN_OPTIONAL_PASSES.includes(pass))
      unrecorded.push(`${pass} has no row: not owed or not run, which the report does not record`);
    else if (passRows.length === 0) failing.push(`${pass} has no held row`);
  }
  if (failing.length > 0) return { name, notes: failing, state: GenshinExitCheckState.NotMet };
  if (unrecorded.length > 0) return { name, notes: unrecorded, state: GenshinExitCheckState.NotMeasurable };
  return { name, notes: [], state: GenshinExitCheckState.Met };
};
