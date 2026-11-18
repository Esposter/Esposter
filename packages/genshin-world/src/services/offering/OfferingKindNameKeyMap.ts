import type { OfferingKind } from "#src/models/offering/OfferingKind";

import { OfferingKind as OfferingKindValues } from "#src/models/offering/OfferingKind";
import { GameTextKey } from "genshin-text";

// The text each offering's prompt is named by, for the offerings the official map places. An offering with no name here
// Has an empty prompt, so a kind joins this map with its point
export const OfferingKindNameKeyMap: Partial<Record<OfferingKind, GameTextKey>> = {
  [OfferingKindValues.AmritaPool]: GameTextKey.AmritaPool,
  [OfferingKindValues.PrimalFlameResonance]: GameTextKey.PrimalFlameResonance,
  [OfferingKindValues.SacredSakura]: GameTextKey.SacredSakura,
  [OfferingKindValues.TonaFlame]: GameTextKey.TonaFlame,
  [OfferingKindValues.TreeOfDreams]: GameTextKey.TreeOfDreams,
};
