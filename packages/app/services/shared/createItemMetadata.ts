import type { ItemMetadata } from "@/shared/models/itemMetadata";

export const createItemMetadata = (): ItemMetadata => {
  const createdAt = new Date();
  return { createdAt, deletedAt: null, updatedAt: createdAt };
};
