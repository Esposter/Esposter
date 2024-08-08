import type { ItemMetadata } from "@/models/shared/ItemMetadata";

export const createItemMetadata = (): ItemMetadata => {
  const createdAt = new Date();
  return { createdAt, deletedAt: null, updatedAt: createdAt };
};
