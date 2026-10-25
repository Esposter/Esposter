import type { AItemEntity } from "#shared/models/entity/AItemEntity";

export const inheritIdentity = (item: AItemEntity, previousItem: AItemEntity, isUnchanged: boolean) => {
  item.id = previousItem.id;
  item.createdAt = previousItem.createdAt;
  if (isUnchanged) item.updatedAt = previousItem.updatedAt;
};
