import type { WeightedValue } from "#src/models/shared/WeightedValue";

import { WeatherKind } from "genshin-engine";

// The game's standard chain of weathers, the one regular areas turn through: each weather's row of weights for the next,
// Normalised over the row, so rain always clears at its next turn. Snow and fog name no row and hold
export const WeatherKindTransitionWeightsMap: Partial<Record<WeatherKind, WeightedValue<WeatherKind>[]>> = {
  [WeatherKind.Clear]: [
    { value: WeatherKind.Clear, weight: 50 },
    { value: WeatherKind.Cloudy, weight: 25 },
    { value: WeatherKind.Rain, weight: 2 },
    { value: WeatherKind.Thunderstorm, weight: 1 },
  ],
  [WeatherKind.Cloudy]: [
    { value: WeatherKind.Clear, weight: 40 },
    { value: WeatherKind.Cloudy, weight: 60 },
    { value: WeatherKind.Rain, weight: 4 },
    { value: WeatherKind.Thunderstorm, weight: 4 },
  ],
  [WeatherKind.Rain]: [
    { value: WeatherKind.Clear, weight: 20 },
    { value: WeatherKind.Cloudy, weight: 20 },
  ],
  [WeatherKind.Thunderstorm]: [
    { value: WeatherKind.Clear, weight: 20 },
    { value: WeatherKind.Cloudy, weight: 30 },
  ],
};
