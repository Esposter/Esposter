import { readMean } from "#src/services/genshinAssets/readMean";
import { findSmallestEigenvector } from "#src/services/genshinParity/findSmallestEigenvector";
import { projectWitnessPoint } from "#src/services/genshinParity/projectWitnessPoint";
import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";
import { InvalidOperationError, Operation } from "@esposter/shared";

type Pixel = readonly [number, number];
type Point = readonly [number, number, number];
// A direct linear transform needs this many points off one plane to fix the projection's eleven degrees of freedom
const DLT_POINT_COUNT = 6;
const ITERATION_LIMIT = 200;
// The step each axis is nudged by to read the Jacobian, metres then degrees, and the step under which a solve has
// Converged
const JACOBIAN_STEPS = [1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4];
const CONVERGED_STEP = 1e-9;
const INITIAL_DAMPING = 1e-3;
const DAMPING_FACTOR = 10;
const readCost = (residuals: readonly number[]): number => residuals.reduce((sum, value) => sum + value ** 2, 0);
// The projection from six or more correspondences in closed form, as the pose it holds: the null vector of the direct
// Linear transform's system over conditioned coordinates gives the three by four projection, whose left three columns'
// Inverse times the fourth places the eye, whose third row faces the view, and whose second row's height over it is the
// Focal length in pixels
const readLinearPose = (correspondences: readonly { pixel: Pixel; point: Point }[], height: number): number[] => {
  const pointCentre = [0, 1, 2].map((axis) => readMean(correspondences.map(({ point }) => point[axis] ?? 0)));
  const pixelCentre = [0, 1].map((axis) => readMean(correspondences.map(({ pixel }) => pixel[axis] ?? 0)));
  const pointScale =
    Math.sqrt(3) /
    readMean(
      correspondences.map(({ point }) => Math.hypot(...point.map((value, axis) => value - (pointCentre[axis] ?? 0)))),
    );
  const pixelScale =
    Math.SQRT2 /
    readMean(
      correspondences.map(({ pixel }) => Math.hypot(...pixel.map((value, axis) => value - (pixelCentre[axis] ?? 0)))),
    );
  const rows = correspondences.flatMap(({ pixel, point }) => {
    const [x = 0, y = 0, z = 0] = point.map((value, axis) => (value - (pointCentre[axis] ?? 0)) * pointScale);
    const [u = 0, v = 0] = pixel.map((value, axis) => (value - (pixelCentre[axis] ?? 0)) * pixelScale);
    return [
      [x, y, z, 1, 0, 0, 0, 0, -u * x, -u * y, -u * z, -u],
      [0, 0, 0, 0, x, y, z, 1, -v * x, -v * y, -v * z, -v],
    ];
  });
  const normal = Array.from({ length: 12 }, (_row, row) =>
    Array.from({ length: 12 }, (_column, column) =>
      rows.reduce((sum, entries) => sum + (entries[row] ?? 0) * (entries[column] ?? 0), 0),
    ),
  );
  const conditioned = findSmallestEigenvector(normal);
  // Undo the conditioning: the pixels' through its inverse on the left, the points' on the right
  const conditionedRow = (row: number): number[] => conditioned.slice(row * 4, row * 4 + 4);
  const unconditionRow = (row: number[]): number[] => {
    const [a = 0, b = 0, c = 0, d = 0] = row;
    return [
      a * pointScale,
      b * pointScale,
      c * pointScale,
      d - (a * (pointCentre[0] ?? 0) + b * (pointCentre[1] ?? 0) + c * (pointCentre[2] ?? 0)) * pointScale,
    ];
  };
  const third = unconditionRow(conditionedRow(2));
  const projection = [0, 1].map((axis) =>
    unconditionRow(conditionedRow(axis)).map(
      (value, column) => value / pixelScale + (pixelCentre[axis] ?? 0) * (third[column] ?? 0),
    ),
  );
  projection.push(third);
  // The points stand in front of the eye, so their depths are positive
  const [firstPoint = [0, 0, 0]] = correspondences.map(({ point }) => point);
  const depth = [...firstPoint, 1].reduce((sum, value, column) => sum + value * (third[column] ?? 0), 0);
  const signed = depth < 0 ? projection.map((row) => row.map((value) => -value)) : projection;
  const left = signed.map((row) => row.slice(0, 3));
  const eye = solveLinearSystem(
    left,
    signed.map((row) => -(row[3] ?? 0)),
  );
  if (!eye) throw new InvalidOperationError(Operation.Read, "pose", "the correspondences lie on a plane");
  const thirdRow = left[2] ?? [0, 0, 1];
  const thirdLength = Math.hypot(...thirdRow);
  const forward = thirdRow.map((value) => value / thirdLength);
  const second = (left[1] ?? [0, 1, 0]).map((value) => value / thirdLength);
  const along = second.reduce((sum, value, axis) => sum + value * (forward[axis] ?? 0), 0);
  const focal = Math.hypot(...second.map((value, axis) => value - along * (forward[axis] ?? 0)));
  const [forwardX = 0, forwardY = 0, forwardZ = 0] = forward;
  return [
    ...eye,
    (Math.atan2(-forwardX, -forwardZ) * 180) / Math.PI,
    (Math.asin(Math.max(-1, Math.min(1, forwardY))) * 180) / Math.PI,
    (2 * Math.atan(height / 2 / focal) * 180) / Math.PI,
  ];
};
// The camera pose (along `CAMERA_POSE_AXES`) from which points whose places are known project onto the pixels they
// Were seen at, with each point's reprojection error in pixels and their root mean square: from six or more, the direct
// Linear transform gives the pose in closed form, and from fewer a start must be given; Levenberg-Marquardt then
// Minimises the reprojection error from it over all six axes, the field of view among them, but for any held. An edge's
// Correspondence, a point on a part's silhouette, is pinned across and free along the silhouette, so only its distance
// Across counts
export const solveCameraPose = (
  correspondences: readonly { isEdge?: boolean; pixel: Pixel; point: Point }[],
  width: number,
  height: number,
  start?: readonly number[],
  // The axes held at the start's values, by their index along `CAMERA_POSE_AXES`: the field of view read from two widths,
  // Where too few points fix it
  heldAxes: readonly number[] = [],
): { errors: number[]; pose: number[]; rms: number } => {
  if (!start && correspondences.length < DLT_POINT_COUNT)
    throw new InvalidOperationError(
      Operation.Read,
      "pose",
      `${correspondences.length} correspondences: ${DLT_POINT_COUNT} or more, or a start`,
    );
  const readResiduals = (pose: readonly number[]): number[] =>
    correspondences.flatMap(({ isEdge, pixel, point }) => {
      const {
        pixel: [u, v],
      } = projectWitnessPoint(pose, point, width, height);
      return [u - pixel[0], isEdge ? 0 : v - pixel[1]];
    });
  let pose = start ? [...start] : readLinearPose(correspondences, height);
  let residuals = readResiduals(pose);
  let damping = INITIAL_DAMPING;
  // One damped step from a pose: the Jacobian read by nudging each axis free to move, then the normal equations with
  // Their diagonal raised by the damping (a held axis's by one more, so it stays put)
  const readStep = (
    from: readonly number[],
    fromResiduals: readonly number[],
    stepDamping: number,
  ): number[] | undefined => {
    const jacobian = JACOBIAN_STEPS.map((step, axis) => {
      if (heldAxes.includes(axis)) return fromResiduals.map(() => 0);
      const nudged = readResiduals(from.map((value, index) => (index === axis ? value + step : value)));
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
    const step = readStep(pose, residuals, damping);
    if (!step) break;
    const candidate = pose.map((value, index) => value + (step[index] ?? 0));
    const candidateResiduals = readResiduals(candidate);
    if (readCost(candidateResiduals) < readCost(residuals)) {
      pose = candidate;
      residuals = candidateResiduals;
      damping /= DAMPING_FACTOR;
      if (Math.hypot(...step) < CONVERGED_STEP) break;
    } else damping *= DAMPING_FACTOR;
  }
  const errors = correspondences.map((_, index) =>
    Math.hypot(residuals[index * 2] ?? 0, residuals[index * 2 + 1] ?? 0),
  );
  return { errors, pose, rms: Math.sqrt(readCost(residuals) / Math.max(correspondences.length, 1)) };
};
