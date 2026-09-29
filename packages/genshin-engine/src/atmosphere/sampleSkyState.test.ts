import type { SkyKeyframe } from "#src/atmosphere/SkyKeyframe";

import { createSkyState } from "#src/atmosphere/createSkyState";
import { sampleSkyState } from "#src/atmosphere/sampleSkyState";
import { Color } from "three";
import { describe, expect, test } from "vitest";

const createSkyKeyframe = (minutes: number, value: number): SkyKeyframe => ({
  cloudLitColor: new Color(value, value, value),
  cloudShadeColor: new Color(value, value, value),
  hemisphereGroundColor: new Color(value, value, value),
  hemisphereIntensity: value,
  hemisphereSkyColor: new Color(value, value, value),
  horizonColor: new Color(value, value, value),
  lightColor: new Color(value, value, value),
  lightIntensity: value,
  minutes,
  starIntensity: value,
  zenithColor: new Color(value, value, value),
});

describe(sampleSkyState, () => {
  const skyKeyframes = [createSkyKeyframe(0, 0), createSkyKeyframe(720, 1)];

  test("blends between the keyframes either side", () => {
    expect.hasAssertions();

    const { lightIntensity, zenithColor } = sampleSkyState(skyKeyframes, 360, 0, createSkyState());

    expect({ lightIntensity, zenithColor }).toStrictEqual({
      lightIntensity: 0.5,
      zenithColor: new Color(0.5, 0.5, 0.5),
    });
  });

  test("wraps through midnight from the last keyframe to the first", () => {
    expect.hasAssertions();

    const { lightIntensity } = sampleSkyState(skyKeyframes, 1080, 0, createSkyState());

    expect(lightIntensity).toBe(0.5);
  });

  test("lights from the moon while the sun is down", () => {
    expect.hasAssertions();

    const { lightDirection, moonDirection } = sampleSkyState(skyKeyframes, 0, 0, createSkyState());

    expect(lightDirection).toStrictEqual(moonDirection);
  });
});
