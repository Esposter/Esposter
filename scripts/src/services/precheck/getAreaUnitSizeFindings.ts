import type { UnitSize } from "#src/models/sweeps/ledgerCoverage/UnitSize";

import { UNIT_FILE_CAP, UNIT_LINE_CAP } from "#src/services/sweeps/ledgerCoverage/constants";

// Each unit of the partition past the cap one pass reads in full, the area list's and the derived openspec folders'
// Alike. A unit past it is split at its directory boundaries, since no sitting reads it whole and a grep pass would
// Stand In for a read that never happened. `readSize` gives each file's share of the size, so the caller decides what
// Is read And the cap is the one thing here
export const getAreaUnitSizeFindings = (
  units: readonly string[],
  unitFiles: ReadonlyMap<string, readonly string[]>,
  readSize: (file: string) => UnitSize,
): string[] =>
  units.flatMap((unit) => {
    const sizes = (unitFiles.get(unit) ?? []).map((file) => readSize(file));
    const files = sizes.reduce((sum, size) => sum + size.files, 0);
    const lines = sizes.reduce((sum, size) => sum + size.lines, 0);
    return files > UNIT_FILE_CAP || lines > UNIT_LINE_CAP
      ? [
          `oversized unit ${unit}: ${files} files and ${lines} code lines, past the cap of ${UNIT_FILE_CAP} files and ${UNIT_LINE_CAP} lines, so split it at its directory boundaries`,
        ]
      : [];
  });
