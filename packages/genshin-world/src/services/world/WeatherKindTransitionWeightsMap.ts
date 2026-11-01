import type { WeightedValue } from "#src/models/shared/WeightedValue";

import { WeatherKind } from "genshin-engine";

// The game's standard chain of weathers, the one regular areas turn through: each weather's row of weights for the next,
// Normalised over the row. An eruption interrupts rain, so rain can turn to one, and an eruption always turns back to
// Rain where the area has it. Snow and fog name no row and hold. The eruption and sandstorm weights are provisional, the
// Game's chains for a volcano and a desert unread: the dump holds no template for a sandstorm, and the wiki says only that
// The desert has them intermittently. Only an area that lists a sandstorm draws one, as it only draws the weathers it lists
export const WeatherKindTransitionWeightsMap: Partial<Record<WeatherKind, WeightedValue<WeatherKind>[]>> = {
  [WeatherKind.Clear]: [
    { value: WeatherKind.Clear, weight: 50 },
    { value: WeatherKind.Cloudy, weight: 25 },
    { value: WeatherKind.Rain, weight: 2 },
    { value: WeatherKind.Thunderstorm, weight: 1 },
    { value: WeatherKind.Sandstorm, weight: 10 },
  ],
  [WeatherKind.Cloudy]: [
    { value: WeatherKind.Clear, weight: 40 },
    { value: WeatherKind.Cloudy, weight: 60 },
    { value: WeatherKind.Rain, weight: 4 },
    { value: WeatherKind.Thunderstorm, weight: 4 },
  ],
  [WeatherKind.Eruption]: [{ value: WeatherKind.Rain, weight: 1 }],
  [WeatherKind.Rain]: [
    { value: WeatherKind.Clear, weight: 20 },
    { value: WeatherKind.Cloudy, weight: 20 },
    { value: WeatherKind.Eruption, weight: 4 },
  ],
  [WeatherKind.Sandstorm]: [
    { value: WeatherKind.Clear, weight: 20 },
    { value: WeatherKind.Cloudy, weight: 20 },
  ],
  [WeatherKind.Thunderstorm]: [
    { value: WeatherKind.Clear, weight: 20 },
    { value: WeatherKind.Cloudy, weight: 30 },
  ],
};
