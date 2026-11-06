import { createArcCurve } from "@/services/visual/globe/createArcCurve";
import { describe, expect, test } from "vitest";

describe(createArcCurve, () => {
  const radius = 100;

  test("an arc peaks at its altitude", () => {
    expect.hasAssertions();

    const curve = createArcCurve({ arcAlt: 0.3, endLat: 0, endLng: 60, startLat: 0, startLng: 0 }, radius);

    expect(curve.getPoint(0.5).length()).toBeCloseTo(radius * 1.3, 6);
  });

  test("an arc runs from its start to its end on the surface", () => {
    expect.hasAssertions();

    const curve = createArcCurve({ arcAlt: 0.3, endLat: 40, endLng: 60, startLat: -20, startLng: 10 }, radius);

    expect(curve.getPoint(0).length()).toBeCloseTo(radius, 6);
    expect(curve.getPoint(1).length()).toBeCloseTo(radius, 6);
  });

  test("an arc between the same place rises straight up", () => {
    expect.hasAssertions();

    const curve = createArcCurve({ arcAlt: 0.2, endLat: 10, endLng: 10, startLat: 10, startLng: 10 }, radius);

    expect(curve.getPoint(0.5).length()).toBeCloseTo(radius * 1.2, 6);
  });
});
