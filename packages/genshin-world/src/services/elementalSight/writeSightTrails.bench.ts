import type { ElementalSight } from "#src/models/sight/ElementalSight";
import type { GroundPoint } from "genshin-engine";

import { SIGHT_REACH, SIGHT_TRAIL_CAPACITY, SIGHT_TRAIL_POINT_CAPACITY } from "#src/services/elementalSight/constants";
import { writeSightTrails } from "#src/services/elementalSight/writeSightTrails";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// The trails a frame draws, a single court and the sight's whole capacity, each court half the reach away
const BENCH_TRAIL_COUNTS = [1, SIGHT_TRAIL_CAPACITY];
const COURT_DISTANCE = SIGHT_REACH / 2;
const ORIGIN: GroundPoint = { x: 0, z: 0 };
const elementalSight: ElementalSight = { isOn: true, origin: ORIGIN, spreadSeconds: 0 };
const getGroundHeight = (x: number, z: number) => x + z;
const createRibbon = () => {
  const vertexCount = SIGHT_TRAIL_CAPACITY * SIGHT_TRAIL_POINT_CAPACITY * 2;
  return {
    colors: new Float32Array(vertexCount * 3),
    indices: new Uint32Array(SIGHT_TRAIL_CAPACITY * (SIGHT_TRAIL_POINT_CAPACITY - 1) * 6),
    positions: new Float32Array(vertexCount * 3),
  };
};
const createCourts = (count: number): GroundPoint[] =>
  Array.from({ length: count }, (_value, index) => {
    const angle = (index / count) * 2 * Math.PI;
    return { x: COURT_DISTANCE * Math.cos(angle), z: COURT_DISTANCE * Math.sin(angle) };
  });

describe(writeSightTrails, () => {
  test.for(BENCH_TRAIL_COUNTS)("%i trails", async (count, { bench }) => {
    const courts = createCourts(count);
    const ribbon = createRibbon();
    await bench("write", () => {
      writeSightTrails(ribbon, elementalSight, ORIGIN, courts, getGroundHeight);
    }).run(BENCHMARK_RUN_OPTIONS);
  });
});
