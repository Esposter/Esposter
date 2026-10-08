import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

import { FRAME_GATE_PIXELS } from "#src/services/genshinParity/passes/constants";

// The layout's readings in each reference's pixels from the gaps of each family's pairs on its frame: the furthest
// Apart where the family has a part on the frame, a family with none there skipped for that reference and noted, since
// Nothing of it is there to read, and a family on no reference's frame at all a miss, since then no frame has placed it
export const computeLayoutFrameMeasure = (
  familyNames: readonly string[],
  references: readonly { families: readonly { gaps: readonly number[]; name: string }[]; referenceId: string }[],
): ParityPassMeasure => {
  const readFamilyNames = new Set(
    references.flatMap(({ families }) => families.filter(({ gaps }) => gaps.length > 0).map(({ name }) => name)),
  );
  return {
    notes: references.flatMap(({ families, referenceId }) =>
      families
        .filter(({ gaps }) => gaps.length === 0)
        .map(({ name }) => `${referenceId} ${name}: skipped, no part on the frame`),
    ),
    readings: [
      ...references.flatMap(({ families, referenceId }) =>
        families
          .filter(({ gaps }) => gaps.length > 0)
          .map(({ gaps, name }) => ({
            gate: FRAME_GATE_PIXELS,
            name: `${referenceId} ${name}`,
            unit: "px",
            value: Math.max(...gaps),
          })),
      ),
      ...familyNames
        .filter((name) => !readFamilyNames.has(name))
        .map((name) => ({
          gate: FRAME_GATE_PIXELS,
          name: `${name} on no reference's frame`,
          unit: "px",
          value: Infinity,
        })),
    ],
  };
};
