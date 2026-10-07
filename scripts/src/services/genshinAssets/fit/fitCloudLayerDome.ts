import type { CloudLayerDome } from "#src/models/genshinAssets/fit/CloudLayerDome";
import type { ExportedMesh } from "#src/models/genshinAssets/shared/ExportedMesh";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { getOrCreate, InvalidOperationError, Operation } from "@esposter/shared";
import { MathUtils } from "three";

// The decimals a profile keeps: a thousandth of the density's plane is a fraction of one of its texels
const PROFILE_DECIMALS = 4;
// The decimals two rings' heights are told apart by, and the radius under which a vertex is the dome's apex
const RING_DECIMALS = 4;
const APEX_RADIUS = 1e-4;
const readPair = (values: null | number[], vertex: number, name: string): [number, number] => {
  if (!values) throw new InvalidOperationError(Operation.Read, name, "the dome has no such texture coordinates");
  return [values[vertex * 2] ?? 0, values[vertex * 2 + 1] ?? 0];
};
// The mean of angles in degrees, read round the circle so a spread across ±180 does not cancel
const computeMeanAngle = (angles: readonly number[]): number =>
  MathUtils.radToDeg(
    Math.atan2(
      angles.reduce((sum, angle) => sum + Math.sin(MathUtils.degToRad(angle)), 0),
      angles.reduce((sum, angle) => sum + Math.cos(MathUtils.degToRad(angle)), 0),
    ),
  );
const computeMean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
// A sky's cloud layer dome as profiles over its rings (`CloudLayerDome`): a dome of rings round a vertical axis, each
// Ring one height, whose first texture coordinates run round it and up it as the wisps' strip, and whose second and
// Third are the density's plane, each a turned projection of the azimuth out to a radius its ring's height sets. The
// Plane's middle is the centroid of the horizon's ring, every ring's radius and the turn are their means, and the
// Residual is how far the projections so drawn stand from the dome's own, root mean square in the plane's units
export const fitCloudLayerDome = ({
  m_Normals,
  m_UV0,
  m_UV1,
  m_UV2,
  m_Vertices,
}: Pick<ExportedMesh, "m_Normals" | "m_UV0" | "m_UV1" | "m_UV2" | "m_Vertices">): {
  dome: CloudLayerDome;
  residual: number;
} => {
  const vertexCount = m_Vertices.length / 3;
  const rings = new Map<
    string,
    { elevations: number[]; normalElevations: number[]; vertices: number[]; wisps: number[] }
  >();
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    const [x = 0, y = 0, z = 0] = m_Vertices.slice(vertex * 3, vertex * 3 + 3);
    const radius = Math.hypot(x, z);
    if (radius < APEX_RADIUS) continue;
    const [normalX = 0, normalY = 0, normalZ = 0] = m_Normals.slice(vertex * 3, vertex * 3 + 3);
    const ring = getOrCreate(rings, y.toFixed(RING_DECIMALS), () => ({
      elevations: [],
      normalElevations: [],
      vertices: [],
      wisps: [],
    }));
    ring.vertices.push(vertex);
    ring.elevations.push(MathUtils.radToDeg(Math.atan2(y, radius)));
    // The normal's tilt from level toward the axis it faces, its horizontal part along the vertex's outward one
    ring.normalElevations.push(MathUtils.radToDeg(Math.atan2(normalY, -(normalX * x + normalZ * z) / radius)));
    ring.wisps.push(readPair(m_UV0, vertex, "m_UV0")[1]);
  }
  const sortedRings = [...rings.values()].toSorted(
    (firstRing, secondRing) => computeMean(firstRing.elevations) - computeMean(secondRing.elevations),
  );
  const [horizon] = sortedRings;
  if (!horizon) throw new InvalidOperationError(Operation.Read, "m_Vertices", "the dome has no rings");
  const readAzimuth = (vertex: number): number =>
    MathUtils.radToDeg(Math.atan2(m_Vertices[vertex * 3 + 2] ?? 0, m_Vertices[vertex * 3] ?? 0));
  const projections = (["m_UV1", "m_UV2"] as const).map((name) => {
    const values = { m_UV1, m_UV2 }[name];
    const center = [0, 1].map((axis) =>
      computeMean(horizon.vertices.map((vertex) => readPair(values, vertex, name)[axis] ?? 0)),
    ) as [number, number];
    const readOffset = (vertex: number): [number, number] => {
      const [u, v] = readPair(values, vertex, name);
      return [u - center[0], v - center[1]];
    };
    const turns = sortedRings.flatMap(({ vertices }) =>
      vertices.map((vertex) => {
        const [u, v] = readOffset(vertex);
        return MathUtils.radToDeg(Math.atan2(v, u)) - readAzimuth(vertex);
      }),
    );
    const radii = sortedRings.map(({ vertices }) =>
      computeMean(vertices.map((vertex) => Math.hypot(...readOffset(vertex)))),
    );
    return { center, radii, readOffset, turn: computeMeanAngle(turns) };
  });
  const [near, far] = projections;
  if (!near || !far) throw new InvalidOperationError(Operation.Read, "m_UV1", "the dome has no projections");
  const wispsTurn = computeMeanAngle(
    horizon.vertices.map((vertex) => readPair(m_UV0, vertex, "m_UV0")[0] * 360 - readAzimuth(vertex)),
  );
  // Every vertex's projections drawn back from the profiles, against the dome's own
  let [squaredSum, count] = [0, 0];
  for (const [ringIndex, { vertices }] of sortedRings.entries())
    for (const vertex of vertices)
      for (const { radii, readOffset, turn } of projections) {
        const angle = MathUtils.degToRad(readAzimuth(vertex) + turn);
        const radius = radii[ringIndex] ?? 0;
        const [u, v] = readOffset(vertex);
        squaredSum += (u - radius * Math.cos(angle)) ** 2 + (v - radius * Math.sin(angle)) ** 2;
        count++;
      }
  const roundProfile = (values: readonly number[]): number[] =>
    values.map((value) => roundFitted(value, PROFILE_DECIMALS));
  return {
    dome: {
      center: near.center.map((value) => roundFitted(value, PROFILE_DECIMALS)) as [number, number],
      elevations: roundProfile(sortedRings.map(({ elevations }) => computeMean(elevations))),
      far: roundProfile(far.radii),
      near: roundProfile(near.radii),
      normalElevations: roundProfile(sortedRings.map(({ normalElevations }) => computeMean(normalElevations))),
      turn: roundFitted(near.turn, PROFILE_DECIMALS),
      wisps: roundProfile(sortedRings.map(({ wisps }) => computeMean(wisps))),
      wispsTurn: roundFitted(wispsTurn, PROFILE_DECIMALS),
    },
    residual: Math.sqrt(squaredSum / Math.max(count, 1)),
  };
};
