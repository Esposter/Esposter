import type { RiverCoursePoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import type { Vector3 } from "three";

// Metres between a course's points along it, each slice of a water surface giving one point on its centreline
const RIVER_COURSE_SLICE_METRES = 1;
// A course breaks where the surface has no vertices for more than this many metres along it
const RIVER_COURSE_GAP_METRES = 4;
// A water surface no longer than this many of its widths is a pond, which the still water covers, not a river
const RIVER_MIN_LENGTH_WIDTHS = 2;

interface SlicePoint {
  along: number;
  point: RiverCoursePoint;
}

const average = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

// A water surface's courses read off its points in the world's axes: along its long axis across the ground, each slice
// Of it a point at the middle of its width with the mean of its level, the surface turned to run downhill from its
// Higher level to its lower, and broken where it has a hole. A pond, no longer than twice its width, has no course
export const computeRiverCourses = (points: readonly Vector3[]): RiverCoursePoint[][] => {
  const centreX = average(points.map(({ x }) => x));
  const centreZ = average(points.map(({ z }) => z));
  let spreadXX = 0;
  let spreadZZ = 0;
  let spreadXZ = 0;
  for (const { x, z } of points) {
    const offsetX = x - centreX;
    const offsetZ = z - centreZ;
    spreadXX += offsetX * offsetX;
    spreadZZ += offsetZ * offsetZ;
    spreadXZ += offsetX * offsetZ;
  }
  const angle = 0.5 * Math.atan2(2 * spreadXZ, spreadXX - spreadZZ);
  const alongX = Math.cos(angle);
  const alongZ = Math.sin(angle);
  const acrossX = -alongZ;
  const acrossZ = alongX;
  const surface = points.map(({ x, y, z }) => {
    const offsetX = x - centreX;
    const offsetZ = z - centreZ;
    return { across: offsetX * acrossX + offsetZ * acrossZ, along: offsetX * alongX + offsetZ * alongZ, level: y };
  });
  const minAlong = Math.min(...surface.map(({ along }) => along));
  const length = Math.max(...surface.map(({ along }) => along)) - minAlong;
  const span = Math.max(...surface.map(({ across }) => across)) - Math.min(...surface.map(({ across }) => across));
  if (length < RIVER_MIN_LENGTH_WIDTHS * span) return [];

  const slices: (typeof surface)[] = Array.from(
    { length: Math.round(length / RIVER_COURSE_SLICE_METRES) + 1 },
    () => [],
  );
  for (const point of surface) slices[Math.round((point.along - minAlong) / RIVER_COURSE_SLICE_METRES)]?.push(point);
  const sliced = slices.flatMap((slice): SlicePoint[] => {
    if (slice.length === 0) return [];
    const sliceAlong = average(slice.map(({ along }) => along));
    const acrossMin = Math.min(...slice.map(({ across }) => across));
    const acrossMax = Math.max(...slice.map(({ across }) => across));
    const across = (acrossMin + acrossMax) / 2;
    return [
      {
        along: sliceAlong,
        point: {
          level: roundFitted(average(slice.map(({ level }) => level))),
          width: roundFitted(acrossMax - acrossMin),
          x: roundFitted(centreX + sliceAlong * alongX + across * acrossX) || 0,
          z: roundFitted(centreZ + sliceAlong * alongZ + across * acrossZ) || 0,
        },
      },
    ];
  });
  const first = sliced[0];
  const last = sliced.at(-1);
  const ordered = first && last && first.point.level < last.point.level ? sliced.toReversed() : sliced;

  const courses: RiverCoursePoint[][] = [];
  let previousAlong: number | undefined;
  for (const { along, point } of ordered) {
    if (previousAlong === undefined || Math.abs(along - previousAlong) > RIVER_COURSE_GAP_METRES) courses.push([]);
    courses.at(-1)?.push(point);
    previousAlong = along;
  }
  return courses.filter((course) => course.length > 1);
};
