import { Element } from "#src/models/Element";
import { WeatherKind } from "genshin-engine";

// The most dishes one batch of Auto Cook makes at once, and the most units of one processing a queue holds
export const COOKING_BATCH_LIMIT = 99;
// The percent a chance in a specialty row is out of
export const PERCENT_TOTAL = 100;
// The one character the game refuses to cook at all, so no dish is made with her
export const RAIDEN_SHOGUN_AVATAR_ID = 10000052;
// Pyro lights a campfire, and the other elements, and rain in the open, put it out
export const CAMPFIRE_LIGHTING_ELEMENT = Element.Pyro;
export const CAMPFIRE_PUTTING_OUT_ELEMENTS: Element[] = [
  Element.Anemo,
  Element.Cryo,
  Element.Electro,
  Element.Geo,
  Element.Hydro,
];
export const CAMPFIRE_PUTTING_OUT_WEATHERS: WeatherKind[] = [WeatherKind.Rain, WeatherKind.Thunderstorm];
// Provisional: the share of the regular zone the delicious zone takes, centred on the same point. It is measured off a
// Recording of the cooking screen, as the zones' layout is
export const DELICIOUS_ZONE_SHARE = 0.5;
// The name the scene gives Mondstadt's stove among its building points, and the id of the stove's row in the prompts,
// Which holds the one stove the world offers
export const MONDSTADT_COOKING_STOVE_BUILDING_NAME = "Restaurant";
export const COOKING_STOVE_INTERACTABLE_ID = "cookingStove";
// The stove's second row, which opens its processing screen beside the cooking one
export const COOKING_PROCESSING_INTERACTABLE_ID = "cookingProcessing";
// Provisional: the seconds the pointer takes to cross the indicator's bar from one end to the other, measured off one
// PC clip of the cooking screen from February 2026 and extrapolated from partial sweeps.
// Whether it swings back or loops is not yet seen
export const COOKING_POINTER_SWEEP_SECONDS = 3;
