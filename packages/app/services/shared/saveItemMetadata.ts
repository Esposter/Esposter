import type { ItemMetadata } from "@/shared/models/itemMetadata";

export const saveItemMetadata = (itemMetadata: ItemMetadata) => {
  itemMetadata.updatedAt = new Date();
};
