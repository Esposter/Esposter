import { WeatherKind } from "genshin-engine";

const INAZUMA_REGION_ID = "inazuma";

// The weathers an area turns through: Inazuma's permanent thunderstorm is lifted in its areas unless the player has
// Restored it, and an area whose only weather it is holds clear. Other regions keep their own weathers as they are
export const getAreaWeathers = (
  weathers: readonly WeatherKind[],
  regionId: string,
  isStormRestored: boolean,
): WeatherKind[] => {
  if (regionId !== INAZUMA_REGION_ID || isStormRestored) return [...weathers];
  const liftedWeathers = weathers.filter((weather) => weather !== WeatherKind.Thunderstorm);
  return liftedWeathers.length > 0 ? liftedWeathers : [WeatherKind.Clear];
};
