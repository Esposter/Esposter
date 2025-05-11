import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";

export const saveItemMetadata = (itemMetadata: ItemMetadata) => {
  itemMetadata.updatedAt = new Date();
};
