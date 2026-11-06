import { getArcState } from "@/services/visual/globe/getArcState";
import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";
import { describe, expect, test } from "vitest";

const { arcGrowTime, arcHoldTime, arcStagger } = GlobeConfiguration;
describe(getArcState, () => {
  const period = 2 * arcGrowTime + arcHoldTime;

  test("an arc waits for its turn", () => {
    expect.hasAssertions();

    expect(getArcState(arcStagger - 1, 1)).toStrictEqual({ end: 0, pulseOpacity: 0, pulseScale: 0, start: 0 });
  });

  test("an arc grows from its start", () => {
    expect.hasAssertions();

    const { end, start } = getArcState(arcGrowTime / 2, 0);

    expect(start).toBe(0);
    expect(end).toBeGreaterThan(0);
    expect(end).toBeLessThan(1);
  });

  test("an arc that has landed pulses where it lands", () => {
    expect.hasAssertions();

    const { end, pulseOpacity, pulseScale, start } = getArcState(arcGrowTime + 1, 0);

    expect(start).toBe(0);
    expect(end).toBe(1);
    expect(pulseOpacity).toBeGreaterThan(0);
    expect(pulseScale).toBeGreaterThan(0);
  });

  test("an arc shrinks away from its start", () => {
    expect.hasAssertions();

    const { end, start } = getArcState(arcGrowTime + arcHoldTime + arcGrowTime / 2, 0);

    expect(end).toBe(1);
    expect(start).toBeGreaterThan(0);
    expect(start).toBeLessThan(1);
  });

  test("an arc repeats every period", () => {
    expect.hasAssertions();

    expect(getArcState(arcGrowTime / 2 + period, 0)).toStrictEqual(getArcState(arcGrowTime / 2, 0));
  });
});
