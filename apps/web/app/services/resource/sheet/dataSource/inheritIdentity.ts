import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "@esposter/shared";

export const inheritIdentity = (item: ToData<AItemEntity>, previousItem: ToData<AItemEntity>, isUnchanged: boolean) => {
  item.id = previousItem.id;
  item.createdAt = previousItem.createdAt;
  if (isUnchanged) item.updatedAt = previousItem.updatedAt;
};
