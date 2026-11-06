import { getNextAreaWeather } from "#src/services/world/getNextAreaWeather";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getNextAreaWeather, () => {
  const AREA_WEATHERS = [
    WeatherKind.Clear,
    WeatherKind.Cloudy,
    WeatherKind.Eruption,
    WeatherKind.Rain,
    WeatherKind.Thunderstorm,
  ];

  test("draws clear after clear and thunderstorm at the top of the draw", () => {
    expect.hasAssertions();

    expect(getNextAreaWeather(WeatherKind.Clear, AREA_WEATHERS, () => 0)).toBe(WeatherKind.Clear);
    expect(getNextAreaWeather(WeatherKind.Clear, AREA_WEATHERS, () => 0.99)).toBe(WeatherKind.Thunderstorm);
  });

  test("rain turns to clear, cloudy or an eruption at the next change", () => {
    expect.hasAssertions();

    const rainTurns = Array.from({ length: 1000 }, (_value, index) =>
      getNextAreaWeather(WeatherKind.Rain, AREA_WEATHERS, () => index / 1000),
    );

    expect(new Set(rainTurns)).toStrictEqual(new Set([WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Eruption]));
  });

  test("rain resumes after an eruption", () => {
    expect.hasAssertions();

    const eruptionTurns = Array.from({ length: 1000 }, (_value, index) =>
      getNextAreaWeather(WeatherKind.Eruption, AREA_WEATHERS, () => index / 1000),
    );

    expect(new Set(eruptionTurns)).toStrictEqual(new Set([WeatherKind.Rain]));
  });

  test("a desert turns between clear and a sandstorm", () => {
    expect.hasAssertions();

    const desertWeathers = [WeatherKind.Clear, WeatherKind.Sandstorm];
    const draw = (weather: WeatherKind) =>
      new Set(
        Array.from({ length: 1000 }, (_value, index) =>
          getNextAreaWeather(weather, desertWeathers, () => index / 1000),
        ),
      );

    expect(draw(WeatherKind.Clear)).toStrictEqual(new Set([WeatherKind.Clear, WeatherKind.Sandstorm]));
    expect(draw(WeatherKind.Sandstorm)).toStrictEqual(new Set([WeatherKind.Clear]));
  });

  test("holds snow, which the chain names no next weather for", () => {
    expect.hasAssertions();

    expect(getNextAreaWeather(WeatherKind.Snow, [WeatherKind.Snow], () => 0.5)).toBe(WeatherKind.Snow);
  });

  test("An area turns only among its own weathers", () => {
    expect.hasAssertions();

    const withoutThunderstorm = [WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Rain];

    expect(getNextAreaWeather(WeatherKind.Clear, withoutThunderstorm, () => 0.99)).toBe(WeatherKind.Rain);
    expect(getNextAreaWeather(WeatherKind.Thunderstorm, withoutThunderstorm, () => 0.5)).toBe(WeatherKind.Cloudy);
  });
});
