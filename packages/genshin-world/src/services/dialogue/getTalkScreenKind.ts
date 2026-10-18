import type { Resident } from "#src/models/world/Resident";

import { ScreenKind } from "#src/models/screen/ScreenKind";
import { getTalkVendorShopId } from "#src/services/dialogue/getTalkVendorShopId";

// The screen a talk opens when the player begins it: a nation's Reputation keeper's talk opens the Reputation screen in
// Place of the talk, a city vendor's talk opens their shop, and every other talk is the dialogue. A keeper not yet placed in
// The world has no resident to match, so Her talk stays the dialogue and no Reputation screen opens from the world
export const getTalkScreenKind = (
  talkId: string,
  residents: readonly Resident[],
  vendorShopTypeMap?: Partial<Record<string, number>>,
): ScreenKind.Dialogue | ScreenKind.Reputation | ScreenKind.Shop => {
  if (residents.some((resident) => resident.keepsReputation && resident.talkId === talkId))
    return ScreenKind.Reputation;
  return getTalkVendorShopId(talkId, residents, vendorShopTypeMap) === undefined
    ? ScreenKind.Dialogue
    : ScreenKind.Shop;
};
