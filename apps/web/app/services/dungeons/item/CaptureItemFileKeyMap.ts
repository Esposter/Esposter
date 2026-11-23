import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";

// The texture a capture item throws. It is looked up by the item's id rather than carried on the item.
// An inventory is saved whole, and a texture is the bucket's concern, not the save's
export const CaptureItemFileKeyMap: Partial<Record<ItemId, DungeonsKey>> = {
  [ItemId.DamagedBall]: DungeonsKeys.UIBallsDamagedBall,
};
