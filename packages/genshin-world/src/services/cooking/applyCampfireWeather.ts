import type { WeatherKind } from "genshin-engine";

import { CAMPFIRE_PUTTING_OUT_WEATHERS } from "#src/services/cooking/constants";

// Whether a campfire in the open stays lit under the weather: rain puts it out, and any other weather leaves it as it was
export const applyCampfireWeather = (isLit: boolean, weather: WeatherKind): boolean =>
  CAMPFIRE_PUTTING_OUT_WEATHERS.includes(weather) ? false : isLit;
