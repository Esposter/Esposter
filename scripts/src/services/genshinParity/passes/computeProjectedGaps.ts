import type { Vector } from "#src/models/shared/Vector";

import { projectWitnessPoint } from "#src/services/genshinParity/witness/projectWitnessPoint";

// The pixel distance between each fitted point and the export it stands for, both projected from the reference's pose
// At the reference's size, so a placement reads where it lands on the frame and not in metres. Only a pair whose export
// Stands in front of the eye and lands on the frame is read, since a part the frame does not show is not placed by it
export const computeProjectedGaps = (
  pose: readonly number[],
  pairs: readonly { expected: Readonly<Vector>; fitted: Readonly<Vector> }[],
  width: number,
  height: number,
): number[] =>
  pairs.flatMap(({ expected, fitted }) => {
    const {
      depth,
      pixel: [expectedU, expectedV],
    } = projectWitnessPoint(pose, expected, width, height);
    if (depth <= 0 || expectedU < 0 || expectedU > width || expectedV < 0 || expectedV > height) return [];
    const {
      pixel: [fittedU, fittedV],
    } = projectWitnessPoint(pose, fitted, width, height);
    return [Math.hypot(fittedU - expectedU, fittedV - expectedV)];
  });
