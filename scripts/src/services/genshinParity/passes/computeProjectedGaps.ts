import type { Vector } from "#src/models/shared/Vector";

import { projectWitnessPoint } from "#src/services/genshinParity/witness/projectWitnessPoint";

// The pixel distance between each fitted point and the export it stands for, both projected from the reference's pose
// At the reference's size, so a placement reads where it lands on the frame and not in metres
export const computeProjectedGaps = (
  pose: readonly number[],
  pairs: readonly { expected: Readonly<Vector>; fitted: Readonly<Vector> }[],
  width: number,
  height: number,
): number[] =>
  pairs.map(({ expected, fitted }) => {
    const {
      pixel: [fittedU, fittedV],
    } = projectWitnessPoint(pose, fitted, width, height);
    const {
      pixel: [expectedU, expectedV],
    } = projectWitnessPoint(pose, expected, width, height);
    return Math.hypot(fittedU - expectedU, fittedV - expectedV);
  });
