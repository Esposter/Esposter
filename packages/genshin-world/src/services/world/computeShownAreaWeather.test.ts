import { computeShownAreaWeather } from "#src/services/world/computeShownAreaWeather";
import { getNextAreaWeather } from "#src/services/world/getNextAreaWeather";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeShownAreaWeather, () => {
  const AREA_WEATHERS = [WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Rain, WeatherKind.Thunderstorm];
  // Every draw of the chain from clear, a thousandth apart, so each weather it can turn to is reached
  const TURNS = Array.from({ length: 1000 }, (_, index) =>
    getNextAreaWeather(WeatherKind.Clear, AREA_WEATHERS, () => index / 1000),
  );

  test("a city's weather never turns to rain", () => {
    expect.hasAssertions();

    expect(TURNS).toContain(WeatherKind.Rain);
    expect(TURNS.map((turned) => computeShownAreaWeather(turned, true))).not.toContain(WeatherKind.Rain);
  });

  test("a weather outside a city shows as it turned", () => {
    expect.hasAssertions();

    expect(TURNS.map((turned) => computeShownAreaWeather(turned, false))).toStrictEqual(TURNS);
  });
});
