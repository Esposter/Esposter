import { getNextAreaWeather } from "#src/services/world/getNextAreaWeather";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getNextAreaWeather, () => {
  const AREA_WEATHERS = [WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Rain, WeatherKind.Thunderstorm];

  test("draws clear after clear and thunderstorm at the top of the draw", () => {
    expect.hasAssertions();

    expect(getNextAreaWeather(WeatherKind.Clear, AREA_WEATHERS, () => 0)).toBe(WeatherKind.Clear);
    expect(getNextAreaWeather(WeatherKind.Clear, AREA_WEATHERS, () => 0.99)).toBe(WeatherKind.Thunderstorm);
  });

  test("rain always turns to clear or cloudy at the next change", () => {
    expect.hasAssertions();

    const rainTurns = Array.from({ length: 1000 }, (_, index) =>
      getNextAreaWeather(WeatherKind.Rain, AREA_WEATHERS, () => index / 1000),
    );

    expect(new Set(rainTurns)).toStrictEqual(new Set([WeatherKind.Clear, WeatherKind.Cloudy]));
  });

  test("holds snow, which the chain names no next weather for", () => {
    expect.hasAssertions();

    expect(getNextAreaWeather(WeatherKind.Snow, [WeatherKind.Snow], () => 0.5)).toBe(WeatherKind.Snow);
  });

  test("never turns to a weather the area lacks", () => {
    expect.hasAssertions();

    const withoutThunderstorm = [WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Rain];

    expect(getNextAreaWeather(WeatherKind.Clear, withoutThunderstorm, () => 0.99)).toBe(WeatherKind.Rain);
    expect(getNextAreaWeather(WeatherKind.Thunderstorm, withoutThunderstorm, () => 0.5)).toBe(WeatherKind.Cloudy);
  });
});
