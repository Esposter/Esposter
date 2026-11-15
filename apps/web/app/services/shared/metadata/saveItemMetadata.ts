import type { ItemMetadata } from "#shared/models/shared/ItemMetadata";

export const saveItemMetadata = (itemMetadata: Pick<ItemMetadata, "updatedAt">) => {
  itemMetadata.updatedAt = new Date();
};
