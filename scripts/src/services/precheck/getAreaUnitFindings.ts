import { LEDGER_AREA_DIRECTORY } from "#src/services/sweeps/constants";
import { getUnitPaths } from "#src/services/sweeps/ledgerCoverage/getUnitPaths";

// Each path an area unit names that no tracked file is at or under. A rename or a removal leaves its unit naming a path
// Nothing holds, and no other check fails on it, so the unit would read as covering files it no longer covers. Every
// Tracked file is held at each of its ancestor directories too, so a path is one lookup
export const getAreaUnitFindings = (
  unitsByArea: Record<string, readonly string[]>,
  trackedFiles: readonly string[],
): string[] => {
  const heldPaths = new Set(
    trackedFiles.flatMap((file) =>
      file.split("/").map((_segment, index, segments) => segments.slice(0, index + 1).join("/")),
    ),
  );
  return Object.entries(unitsByArea).flatMap(([area, units]) =>
    units.flatMap((unit) =>
      getUnitPaths(unit)
        .filter((path) => !heldPaths.has(path))
        .map(
          (path) =>
            `dead path ${path} in ${LEDGER_AREA_DIRECTORY}/${area}.md: no tracked file is at or under it, so respell the unit to the files that exist`,
        ),
    ),
  );
};
