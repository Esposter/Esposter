import { Element } from "#src/models/Element";
import { GameTextKey } from "genshin-text";

// Each element by the game's own word for it, as the character screen's band names the chosen character's element
export const ElementNameGameTextKeyMap = {
  [Element.Anemo]: GameTextKey.ElementNameAnemo,
  [Element.Cryo]: GameTextKey.ElementNameCryo,
  [Element.Dendro]: GameTextKey.ElementNameDendro,
  [Element.Electro]: GameTextKey.ElementNameElectro,
  [Element.Geo]: GameTextKey.ElementNameGeo,
  [Element.Hydro]: GameTextKey.ElementNameHydro,
  [Element.Pyro]: GameTextKey.ElementNamePyro,
} as const satisfies Record<Element, GameTextKey>;
