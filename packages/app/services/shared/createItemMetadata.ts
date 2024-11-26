import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";

export const createItemMetadata = (): ItemMetadata => {
  const createdAt = new Date();
  return { createdAt, deletedAt: null, updatedAt: createdAt };
};
