import type { ItemMetadata } from "@esposter/shared";

export const saveItemMetadata = (itemMetadata: Pick<ItemMetadata, "updatedAt">) => {
  itemMetadata.updatedAt = new Date();
};
