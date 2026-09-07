import { FileKey } from "#shared/generated/phaser/FileKey";
import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";

// The texture a capture item throws. It is looked up by the item's id rather than carried on the item, since an
// Inventory is saved whole and a texture is the bucket's concern, not the save's
export const CaptureItemFileKeyMap: Partial<Record<ItemId, FileKey>> = {
  [ItemId.DamagedBall]: FileKey.UIBallsDamagedBall,
};
