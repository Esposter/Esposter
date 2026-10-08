import type { RiverCoursePoint } from "#src/models/water/RiverCoursePoint";

import { BufferGeometry, Float32BufferAttribute } from "three";

// A river's surface as a ribbon along its course, two vertices a point across it at the water's width and level. Across
// The ribbon u runs from one bank to the other, and down the course v runs in metres from the head, so a texture or a
// Flow reads downstream. The course needs two points or more to have a direction
export const createRiverGeometry = (course: readonly RiverCoursePoint[]): BufferGeometry => {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let downstream = 0;
  course.forEach((point, index) => {
    const { level, width, x, z } = point;
    const previous = course[Math.max(index - 1, 0)] ?? point;
    const next = course[Math.min(index + 1, course.length - 1)] ?? point;
    downstream += Math.hypot(x - previous.x, z - previous.z);
    const tangentX = next.x - previous.x;
    const tangentZ = next.z - previous.z;
    const tangentLength = Math.hypot(tangentX, tangentZ);
    const halfWidth = width / 2;
    const acrossX = (-tangentZ / tangentLength) * halfWidth;
    const acrossZ = (tangentX / tangentLength) * halfWidth;
    positions.push(x - acrossX, level, z - acrossZ, x + acrossX, level, z + acrossZ);
    uvs.push(0, downstream, 1, downstream);
    if (index > 0) {
      const bankAtPrevious = index * 2 - 2;
      const bankAtPoint = index * 2;
      indices.push(bankAtPrevious, bankAtPrevious + 1, bankAtPoint, bankAtPrevious + 1, bankAtPoint + 1, bankAtPoint);
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
};
