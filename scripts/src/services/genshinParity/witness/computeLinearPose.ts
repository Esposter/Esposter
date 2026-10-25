import type { Pixel } from "#src/models/genshinParity/witness/Pixel";
import type { Vector } from "#src/models/shared/Vector";

import { findSmallestEigenvector } from "#src/services/genshinParity/witness/findSmallestEigenvector";
import { solveLinearSystem } from "#src/services/recreation/solve/solveLinearSystem";
import { computeMean } from "#src/services/recreation/statistics/computeMean";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { MathUtils } from "three";

// The projection from six or more correspondences in closed form, as the pose it holds: the null vector of the direct
// Linear transform's system over conditioned coordinates gives the three by four projection, whose left three columns'
// Inverse times the fourth places the eye, whose third row faces the view, and whose second row's height over it is the
// Focal length in pixels
export const computeLinearPose = (
  correspondences: readonly { pixel: Pixel; point: Readonly<Vector> }[],
  height: number,
): number[] => {
  const pointCentre = [0, 1, 2].map((axis) => computeMean(correspondences.map(({ point }) => point[axis] ?? 0)));
  const pixelCentre = [0, 1].map((axis) => computeMean(correspondences.map(({ pixel }) => pixel[axis] ?? 0)));
  const pointScale =
    Math.sqrt(3) /
    computeMean(
      correspondences.map(({ point }) => Math.hypot(...point.map((value, axis) => value - (pointCentre[axis] ?? 0)))),
    );
  const pixelScale =
    Math.SQRT2 /
    computeMean(
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
    MathUtils.radToDeg(Math.atan2(-forwardX, -forwardZ)),
    MathUtils.radToDeg(Math.asin(Math.max(-1, Math.min(1, forwardY)))),
    MathUtils.radToDeg(2 * Math.atan(height / 2 / focal)),
  ];
};
