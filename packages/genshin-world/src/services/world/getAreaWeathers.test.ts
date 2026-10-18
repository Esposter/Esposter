import { getAreaWeathers } from "#src/services/world/getAreaWeathers";
import { WeatherKind } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(getAreaWeathers, () => {
  const NARUKAMI_WEATHERS = [WeatherKind.Clear, WeatherKind.Cloudy, WeatherKind.Rain, WeatherKind.Thunderstorm];

  test("inazuma's storm is lifted by default", () => {
    expect.hasAssertions();

    expect(getAreaWeathers(NARUKAMI_WEATHERS, "inazuma", false)).toStrictEqual([
      WeatherKind.Clear,
      WeatherKind.Cloudy,
      WeatherKind.Rain,
    ]);
  });

  test("the storm returns when restored from the weather control", () => {
    expect.hasAssertions();

    expect(getAreaWeathers(NARUKAMI_WEATHERS, "inazuma", true)).toStrictEqual(NARUKAMI_WEATHERS);
  });

  test("an area whose only weather is the storm holds clear once it is lifted", () => {
    expect.hasAssertions();

    expect(getAreaWeathers([WeatherKind.Thunderstorm], "inazuma", false)).toStrictEqual([WeatherKind.Clear]);
  });

  test("another region's thunderstorms are left as they are", () => {
    expect.hasAssertions();

    expect(getAreaWeathers(NARUKAMI_WEATHERS, "mondstadt", false)).toStrictEqual(NARUKAMI_WEATHERS);
  });
});
