import { Element } from "genshin-world";
import { GcsimElement } from "#src/models/genshinAssets/kits/gcsim/GcsimElement";

// The elements gcsim names in an `AttackInfo` literal, the game's own as the kit names them
export const GcsimElementMap: Partial<Record<string, Element>> = {
  [GcsimElement.Anemo]: Element.Anemo,
  [GcsimElement.Cryo]: Element.Cryo,
  [GcsimElement.Dendro]: Element.Dendro,
  [GcsimElement.Electro]: Element.Electro,
  [GcsimElement.Geo]: Element.Geo,
  [GcsimElement.Hydro]: Element.Hydro,
  [GcsimElement.Pyro]: Element.Pyro,
};
