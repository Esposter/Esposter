import type { WeatherKind } from "genshin-engine";

import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { WeatherKindTransitionWeightsMap } from "#src/services/world/WeatherKindTransitionWeightsMap";

// The weather an area turns to from its current one: drawn by the game's chain among the weathers the area can have,
// Its current weather holding where no weight of the chain is left for the area's own
export const getNextAreaWeather = (
  currentWeather: WeatherKind,
  areaWeathers: readonly WeatherKind[],
  random: () => number,
): WeatherKind => {
  const weightedValues = (WeatherKindTransitionWeightsMap[currentWeather] ?? []).filter(({ value }) =>
    areaWeathers.includes(value),
  );
  if (weightedValues.length === 0) return currentWeather;
  return drawWeightedValue(weightedValues, random);
};
