import { applyCampfireWeather } from "#src/services/cooking/applyCampfireWeather";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(applyCampfireWeather, () => {
  test("should put a lit campfire out in rain or a thunderstorm", () => {
    expect.hasAssertions();

    expect(applyCampfireWeather(true, WeatherKind.Rain)).toBe(false);
    expect(applyCampfireWeather(true, WeatherKind.Thunderstorm)).toBe(false);
  });

  test("should leave a campfire as it was under any other weather", () => {
    expect.hasAssertions();

    expect(applyCampfireWeather(true, WeatherKind.Clear)).toBe(true);
    expect(applyCampfireWeather(false, WeatherKind.Snow)).toBe(false);
  });
});
