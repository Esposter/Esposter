import type { SkyDistance } from "#src/models/genshinParity/sky/SkyDistance";

import { checkIsReadingHeld } from "#src/services/genshinParity/passes/checkIsReadingHeld";
import { toSkyReadings } from "#src/services/genshinParity/sky/toSkyReadings";
import { describe, expect, test } from "vitest";

const createDistance = (distance: Partial<SkyDistance> = {}): SkyDistance => ({
  brightness: 0,
  cloudColour: 0,
  colour: 0,
  cover: 0,
  edgeSharpness: 0,
  spread: 0,
  ...distance,
});

describe(toSkyReadings, () => {
  const SPREAD = 0.1;
  const MISS = 1;
  const createSpread = (spread: Partial<SkyDistance> = {}): SkyDistance => ({
    brightness: SPREAD,
    cloudColour: SPREAD,
    colour: 0,
    cover: SPREAD,
    edgeSharpness: SPREAD,
    spread: SPREAD,
    ...spread,
  });

  test("each hour's cloud layer matches its reference", () => {
    expect.hasAssertions();

    const readings = toSkyReadings("a", createDistance(), createSpread());

    expect(Object.fromEntries(readings.map((reading) => [reading.name, checkIsReadingHeld(reading)]))).toStrictEqual({
      "a clear sky colour": true,
      "a cloud brightness": true,
      "a cloud colour": true,
      "a cloud cover": true,
      "a cloud edges": true,
      "a cloud spread": true,
    });
  });

  test("an hour whose clouds miss their gate is not accepted", () => {
    expect.hasAssertions();

    const readings = toSkyReadings("a", createDistance({ cover: MISS }), createSpread());

    expect(Object.fromEntries(readings.map((reading) => [reading.name, checkIsReadingHeld(reading)]))).toStrictEqual({
      "a clear sky colour": true,
      "a cloud brightness": true,
      "a cloud colour": true,
      "a cloud cover": false,
      "a cloud edges": true,
      "a cloud spread": true,
    });
  });

  test("scattered clouds are scored by their statistics", () => {
    expect.hasAssertions();

    const readings = toSkyReadings("a", createDistance({ brightness: MISS }), createSpread({ cover: MISS }));

    expect(Object.fromEntries(readings.map((reading) => [reading.name, checkIsReadingHeld(reading)]))).toStrictEqual({
      "a clear sky colour": true,
      "a cloud brightness": false,
      "a cloud colour": true,
      "a cloud cover": true,
      "a cloud edges": true,
      "a cloud spread": true,
    });
  });

  test("a cloud layer that wins only on pixels is not accepted", () => {
    expect.hasAssertions();

    const readings = toSkyReadings("a", createDistance({ brightness: MISS }), createSpread());

    expect(readings.every((reading) => checkIsReadingHeld(reading))).toBe(false);
    expect(Object.fromEntries(readings.map((reading) => [reading.name, checkIsReadingHeld(reading)]))).toStrictEqual({
      "a clear sky colour": true,
      "a cloud brightness": false,
      "a cloud colour": true,
      "a cloud cover": true,
      "a cloud edges": true,
      "a cloud spread": true,
    });
  });
});
