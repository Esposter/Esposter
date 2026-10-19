import { INAZUMA_REGION_ID } from "#src/services/world/constants";
import { WeatherKind } from "genshin-engine";

// The weathers an area turns through. An area whose only weather it is holds clear, and other regions keep their own
// Weathers as they are.
export const getAreaWeathers = (
  weathers: readonly WeatherKind[],
  regionId: string,
  isStormRestored: boolean,
): WeatherKind[] => {
  if (regionId !== INAZUMA_REGION_ID || isStormRestored) return [...weathers];
  const liftedWeathers = weathers.filter((weather) => weather !== WeatherKind.Thunderstorm);
  return liftedWeathers.length > 0 ? liftedWeathers : [WeatherKind.Clear];
};
