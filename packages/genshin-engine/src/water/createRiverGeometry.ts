import type { RiverCoursePoint } from "#src/models/water/RiverCoursePoint";

import { BEND_FOAM_FULL_RADIUS_WIDTHS, RIVER_BEND_FOAM_ATTRIBUTE } from "#src/water/constants";
import { BufferGeometry, Float32BufferAttribute } from "three";

// A river's surface as a ribbon along its course, two vertices a point across it at the water's width and level. Across
// The ribbon u runs from one bank to the other, and down the course v runs in metres from the head, so a texture or a
// Flow reads downstream. A bend gathers foam on its outer bank, by how sharply the course turns there for the river's
// Width, written per vertex so the water material reads it and the inner bank stays clear. The course needs two points
// Or more to have a direction
export const createRiverGeometry = (course: readonly RiverCoursePoint[]): BufferGeometry => {
  const positions: number[] = [];
  const uvs: number[] = [];
  const bendFoams: number[] = [];
  const indices: number[] = [];
  let downstream = 0;
  for (const [index, point] of course.entries()) {
    const { level, width, x, z } = point;
    const previous = course[Math.max(index - 1, 0)] ?? point;
    const next = course[Math.min(index + 1, course.length - 1)] ?? point;
    const inLength = Math.hypot(x - previous.x, z - previous.z);
    const outLength = Math.hypot(next.x - x, next.z - z);
    downstream += inLength;
    const tangentX = next.x - previous.x;
    const tangentZ = next.z - previous.z;
    const tangentLength = Math.hypot(tangentX, tangentZ);
    const halfWidth = width / 2;
    const acrossX = (-tangentZ / tangentLength) * halfWidth;
    const acrossZ = (tangentX / tangentLength) * halfWidth;
    positions.push(x - acrossX, level, z - acrossZ, x + acrossX, level, z + acrossZ);
    uvs.push(0, downstream, 1, downstream);
    // The angle the course turns through here over the length it turns along, zero at either end
    const turnCross = (x - previous.x) * (next.z - z) - (z - previous.z) * (next.x - x);
    const turnDot = (x - previous.x) * (next.x - x) + (z - previous.z) * (next.z - z);
    const curvature =
      inLength > 0 && outLength > 0 ? Math.abs(Math.atan2(turnCross, turnDot)) / ((inLength + outLength) / 2) : 0;
    const bendFoam = Math.min(curvature * width * BEND_FOAM_FULL_RADIUS_WIDTHS, 1);
    // A course turning toward the bank at u of 1 has its outer bank at u of 0, and the other way about
    if (turnCross > 0) bendFoams.push(bendFoam, 0);
    else bendFoams.push(0, bendFoam);
    if (index > 0) {
      const bankAtPrevious = index * 2 - 2;
      const bankAtPoint = index * 2;
      indices.push(bankAtPrevious, bankAtPrevious + 1, bankAtPoint, bankAtPrevious + 1, bankAtPoint + 1, bankAtPoint);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute(RIVER_BEND_FOAM_ATTRIBUTE, new Float32BufferAttribute(bendFoams, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};
