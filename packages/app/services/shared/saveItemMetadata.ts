import type { ItemMetadata } from "@/models/shared/ItemMetadata";

export const saveItemMetadata = (itemMetadata: ItemMetadata) => {
  itemMetadata.updatedAt = new Date();
};
