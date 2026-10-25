import type { Pixel } from "#src/models/genshinParity/witness/Pixel";
import type { Vector } from "#src/models/shared/Vector";

import { computeCost } from "#src/services/genshinParity/witness/computeCost";
import { computeLinearPose } from "#src/services/genshinParity/witness/computeLinearPose";
import { computeReprojectionErrors } from "#src/services/genshinParity/witness/computeReprojectionErrors";
import { solveLinearSystem } from "#src/services/recreation/solve/solveLinearSystem";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A direct linear transform needs this many points off one plane to fix the projection's eleven degrees of freedom
const DLT_POINT_COUNT = 6;
const ITERATION_LIMIT = 200;
// The step each axis is nudged by to read the Jacobian, metres then degrees, and the step under which a solve has
// Converged
const JACOBIAN_STEPS = [1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4];
const CONVERGED_STEP = 1e-9;
const INITIAL_DAMPING = 1e-3;
const DAMPING_FACTOR = 10;

// The camera pose (along `CAMERA_POSE_AXES`) from which points whose places are known project onto the pixels they
// Were seen at, with each point's reprojection error in pixels and their root mean square: from six or more, the direct
// Linear transform gives the pose in closed form, and from fewer a start must be given; Levenberg-Marquardt then
// Minimises the reprojection error from it (`computeReprojectionErrors`) over all six axes, the field of view among
// Them, but for any held
export const solveCameraPose = (
  correspondences: readonly { isEdge?: boolean; pixel: Pixel; point: Readonly<Vector> }[],
  width: number,
  height: number,
  start?: readonly number[],
  // The axes held at the start's values, by their index along `CAMERA_POSE_AXES`: the field of view read from two
  // Widths, where too few points fix it
  heldAxes: readonly number[] = [],
): { errors: number[]; pose: number[]; rms: number } => {
  if (!start && correspondences.length < DLT_POINT_COUNT)
    throw new InvalidOperationError(
      Operation.Read,
      "pose",
      `${correspondences.length} correspondences: ${DLT_POINT_COUNT} or more, or a start`,
    );
  const computeResiduals = (pose: readonly number[]): number[] =>
    computeReprojectionErrors(pose, correspondences, width, height).flat();
  let pose = start ? [...start] : computeLinearPose(correspondences, height);
  let residuals = computeResiduals(pose);
  let damping = INITIAL_DAMPING;
  // One damped step from a pose: the Jacobian read by nudging each axis free to move, then the normal equations with
  // Their diagonal raised by the damping (a held axis's by one more, so it stays put)
  const computeStep = (
    from: readonly number[],
    fromResiduals: readonly number[],
    stepDamping: number,
  ): number[] | undefined => {
    const jacobian = JACOBIAN_STEPS.map((step, axis) => {
      if (heldAxes.includes(axis)) return fromResiduals.map(() => 0);
      const nudged = computeResiduals(from.map((value, index) => (index === axis ? value + step : value)));
      return nudged.map((value, row) => (value - (fromResiduals[row] ?? 0)) / step);
    });
    const gradient = jacobian.map((column) =>
      column.reduce((sum, value, row) => sum + value * (fromResiduals[row] ?? 0), 0),
    );
    const damped = jacobian.map((first, index) =>
      jacobian.map((second, column) => {
        const value = first.reduce((sum, entry, row) => sum + entry * (second[row] ?? 0), 0);
        return column === index ? value * (1 + stepDamping) + Number(heldAxes.includes(index)) : value;
      }),
    );
    return solveLinearSystem(
      damped,
      gradient.map((value) => -value),
    );
  };
  for (let iteration = 0; iteration < ITERATION_LIMIT; iteration++) {
    const step = computeStep(pose, residuals, damping);
    if (!step) break;
    const candidate = pose.map((value, index) => value + (step[index] ?? 0));
    const candidateResiduals = computeResiduals(candidate);
    if (computeCost(candidateResiduals) < computeCost(residuals)) {
      pose = candidate;
      residuals = candidateResiduals;
      damping /= DAMPING_FACTOR;
      if (Math.hypot(...step) < CONVERGED_STEP) break;
    } else damping *= DAMPING_FACTOR;
  }
  const errors = correspondences.map((_value, index) =>
    Math.hypot(residuals[index * 2] ?? 0, residuals[index * 2 + 1] ?? 0),
  );
  return { errors, pose, rms: Math.sqrt(computeCost(residuals) / Math.max(correspondences.length, 1)) };
};
