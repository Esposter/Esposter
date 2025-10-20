import type { ItemMetadata } from "@esposter/shared";

export const saveItemMetadata = (itemMetadata: ItemMetadata) => {
  itemMetadata.updatedAt = new Date();
};
