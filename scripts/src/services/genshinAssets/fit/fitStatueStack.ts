import type { Vector } from "#src/models/shared/Vector";
import type { StatueSection, StatueStack } from "genshin-engine";

import { toRadialSector } from "#src/services/genshinAssets/fit/toRadialSector";
import { computeSymmetricEigen } from "#src/services/shared/computeSymmetricEigen";
import { Matrix4, Quaternion, Vector3 } from "three";

// How near to the axis a principal axis may point and still be read as across it
const CROSSING_COSINE = 0.9;
// A sector no point reached takes the lesser of its nearest reached neighbours' radii either way round, so a gap in a
// Thin blade's ring is read across its edge rather than bulging it
const fillEmptySectors = (radii: readonly number[]): number[] =>
  radii.map((radius, sector) => {
    if (radius > 0) return radius;
    const findReached = (step: number): number => {
      for (let distance = 1; distance < radii.length; distance++) {
        const reached = radii[(((sector + step * distance) % radii.length) + radii.length) % radii.length] ?? 0;
        if (reached > 0) return reached;
      }
      return 0;
    };
    return Math.min(findReached(1), findReached(-1));
  });
// Points' spread along each of their principal axes: their centroid, and the axes their covariance's eigenvectors
// Point along, from the greatest spread to the least
const computePrincipalAxes = (points: readonly Vector[]): { axes: Vector3[]; centroid: Vector3 } => {
  const centroid = points
    .reduce((sum, point) => sum.add(new Vector3(...point)), new Vector3())
    .divideScalar(points.length);
  const covariance = [0, 1, 2].map((row) =>
    [0, 1, 2].map(
      (column) =>
        points.reduce(
          (sum, point) =>
            sum +
            ((point[row] ?? 0) - centroid.getComponent(row)) * ((point[column] ?? 0) - centroid.getComponent(column)),
          0,
        ) / points.length,
    ),
  );
  const { values, vectors } = computeSymmetricEigen(covariance);
  const axes = [0, 1, 2]
    .toSorted((firstAxis, secondAxis) => (values[secondAxis] ?? 0) - (values[firstAxis] ?? 0))
    .map((index) => new Vector3(...(vectors[index] ?? [0, 0, 0])).normalize());
  return { axes, centroid };
};
// Points read as one of a statue kit's stacks: along the axis given, or else along their own greatest spread, cut into
// Sections of about `sectionHeight`, each section's ring centred on its points' centroid and its radius at each of
// `angleCount` angles the farthest of its points in that sector, the first angle along the points' next greatest spread
// Across the axis. The stack's foot and turn place it in the frame the points are in. A section no point reaches keeps
// The one below it. Returns the stack in the kit's terms, unrounded
export const fitStatueStack = (
  points: readonly Vector[],
  { angleCount, axis, sectionHeight }: { angleCount: number; axis?: Readonly<Vector>; sectionHeight: number },
): StatueStack => {
  const { axes, centroid } = computePrincipalAxes(points);
  const along = axis ? new Vector3(...axis).normalize() : (axes[0] ?? new Vector3(0, 1, 0));
  // The greatest spread not along the axis, made square to it and turned so its greatest component is positive, since an
  // Eigenvector's sign is arbitrary and the same points should always give the same turn
  const crossing = axes.find((candidate) => Math.abs(candidate.dot(along)) < CROSSING_COSINE) ?? new Vector3(1, 0, 0);
  const across = crossing.clone().addScaledVector(along, -crossing.dot(along)).normalize();
  const greatest = across.toArray().reduce((first, second) => (Math.abs(second) > Math.abs(first) ? second : first));
  if (greatest < 0) across.negate();
  const third = across.clone().cross(along);
  const offset = new Vector3();
  const locals = points.map((point): Vector => {
    offset.set(...point).sub(centroid);
    return [offset.dot(along), offset.dot(across), offset.dot(third)];
  });
  const lengths = locals.map(([length]) => length);
  const foot = Math.min(...lengths);
  const span = Math.max(...lengths) - foot;
  const sectionCount = Math.max(1, Math.round(span / sectionHeight));
  // A flat piece read upright spans nothing along the axis, so its one section is kept a hair tall to bin its points
  const height = Math.max(span / sectionCount, Number.EPSILON);
  const sectionPoints = Array.from({ length: sectionCount }, (): Vector[] => []);
  for (const local of locals)
    sectionPoints[Math.min(sectionCount - 1, Math.floor((local[0] - foot) / height))]?.push(local);
  const sections: StatueSection[] = [];
  for (const members of sectionPoints) {
    const below = sections.at(-1);
    if (members.length === 0) {
      sections.push({
        centre: below?.centre ?? [0, 0],
        height,
        radii: below?.radii ?? Array.from({ length: angleCount }, () => 0),
      });
      continue;
    }
    const centre: [number, number] = [
      members.reduce((sum, [, x]) => sum + x, 0) / members.length,
      members.reduce((sum, point) => sum + point[2], 0) / members.length,
    ];
    const radii = Array.from({ length: angleCount }, () => 0);
    for (const [, x, z] of members) {
      const sector = toRadialSector(x, z, centre, angleCount);
      radii[sector] = Math.max(radii[sector] ?? 0, Math.hypot(x - centre[0], z - centre[1]));
    }
    sections.push({ centre, height, radii: fillEmptySectors(radii) });
  }
  const position = centroid.clone().addScaledVector(along, foot);
  const rotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(across, along, third));
  return { position: position.toArray(), rotation: rotation.toArray(), sections };
};
