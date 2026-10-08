import type { WeatherState } from "#src/models/atmosphere/WeatherState";

import { blendWeatherState } from "#src/atmosphere/blendWeatherState";
import { PrecipitationKind } from "#src/models/atmosphere/PrecipitationKind";
import { describe, expect, test } from "vitest";

describe(blendWeatherState, () => {
  const clear: WeatherState = {
    cloudCoverage: 0,
    fogColor: 0,
    fogColorAmount: 0,
    fogDensity: 0,
    lightningRate: 0,
    precipitationDensity: 0,
    precipitationKind: PrecipitationKind.Rain,
    wetness: 0,
  };
  const snowing: WeatherState = { ...clear, precipitationDensity: 1, precipitationKind: PrecipitationKind.Snow };
  const storm = {
    cloudCoverage: 1,
    fogColor: 1,
    fogDensity: 1,
    lightningRate: 1,
    precipitation: { density: 1, kind: PrecipitationKind.Rain },
    wetness: 1,
  };

  test("moves every field straight toward the settings, half way at a half", () => {
    expect.hasAssertions();

    const weatherState = { ...clear };
    blendWeatherState(clear, storm, 0.5, weatherState);

    expect(weatherState).toStrictEqual({
      cloudCoverage: 0.5,
      fogColor: 1,
      fogColorAmount: 0.5,
      fogDensity: 0.5,
      lightningRate: 0.5,
      precipitationDensity: 0.5,
      precipitationKind: PrecipitationKind.Rain,
      wetness: 0.5,
    });
  });

  test.each([
    [0.25, PrecipitationKind.Snow, 0.5],
    [0.75, PrecipitationKind.Rain, 0.5],
  ])("fades the old particles out before the new fade in, at %s drawing %s", (amount, kind, density) => {
    expect.hasAssertions();

    const weatherState = { ...clear };
    blendWeatherState(snowing, storm, amount, weatherState);

    expect({ density: weatherState.precipitationDensity, kind: weatherState.precipitationKind }).toStrictEqual({
      density,
      kind,
    });
  });
});
