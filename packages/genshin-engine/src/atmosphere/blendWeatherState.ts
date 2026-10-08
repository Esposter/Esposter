import type { WeatherSettings } from "#src/models/atmosphere/WeatherSettings";
import type { WeatherState } from "#src/models/atmosphere/WeatherState";

import { MathUtils } from "three";

// The weather part way from where it stood to a weather's settings, by an amount from none to all, written into the
// State given. Every field moves straight between the two, so a change begun part way through another starts from
// Where the first had reached. One kind of particle falls at a time: where the kind changes, the old fades out over
// The first half and the new fades in over the second, and the haze takes the colour of the weather that tints it
export const blendWeatherState = (
  from: Readonly<WeatherState>,
  { cloudCoverage, fogColor, fogDensity, lightningRate = 0, precipitation, wetness }: WeatherSettings,
  amount: number,
  weatherState: WeatherState,
): void => {
  const fromKind = from.precipitationKind;
  const fromDensity = from.precipitationDensity;
  const toKind = precipitation?.kind ?? fromKind;
  const toDensity = precipitation?.density ?? 0;
  weatherState.cloudCoverage = MathUtils.lerp(from.cloudCoverage, cloudCoverage, amount);
  weatherState.fogColor = fogColor ?? from.fogColor;
  weatherState.fogColorAmount = MathUtils.lerp(from.fogColorAmount, fogColor === undefined ? 0 : 1, amount);
  weatherState.fogDensity = MathUtils.lerp(from.fogDensity, fogDensity, amount);
  weatherState.lightningRate = MathUtils.lerp(from.lightningRate, lightningRate, amount);
  weatherState.wetness = MathUtils.lerp(from.wetness, wetness, amount);
  if (fromDensity === 0 || fromKind === toKind) {
    weatherState.precipitationKind = toKind;
    weatherState.precipitationDensity = MathUtils.lerp(fromDensity, toDensity, amount);
  } else if (amount < 0.5) {
    weatherState.precipitationKind = fromKind;
    weatherState.precipitationDensity = fromDensity * (1 - amount * 2);
  } else {
    weatherState.precipitationKind = toKind;
    weatherState.precipitationDensity = toDensity * (amount * 2 - 1);
  }
};
