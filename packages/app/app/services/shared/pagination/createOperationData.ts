import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { OperationDataKey } from "@/models/shared/pagination/OperationDataKey";

import { uncapitalize } from "@/util/text/uncapitalize";
import { Operation } from "@esposter/shared";

export const createOperationData = <
  TItem extends Pick<AItemEntity, "id">,
  TEntityTypeKey extends EntityTypeKey = "Item",
>(
  itemList: Ref<TItem[]>,
  entityTypeKey: TEntityTypeKey = "Item" as TEntityTypeKey,
) => {
  const pushItemList = (...items: TItem[]) => {
    itemList.value.push(...items);
  };
  const createItem = (newItem: TItem) => {
    itemList.value.push(newItem);
  };
  const updateItem = (updatedItem: Partial<TItem>) => {
    const index = itemList.value.findIndex((i) => i.id === updatedItem.id);
    if (index === -1) return;

    Object.assign(itemList.value[index], { ...updatedItem, updatedAt: new Date() });
  };
  const deleteItem = (id: TItem["id"]) => {
    itemList.value = itemList.value.filter((i) => i.id !== id);
  };
  return {
    [`${uncapitalize(entityTypeKey)}List`]: itemList,
    [`${uncapitalize(Operation.Create)}${entityTypeKey}`]: createItem,
    [`${uncapitalize(Operation.Delete)}${entityTypeKey}`]: deleteItem,
    [`${uncapitalize(Operation.Push)}${entityTypeKey}List`]: pushItemList,
    [`${uncapitalize(Operation.Update)}${entityTypeKey}`]: updateItem,
  } as {
    [P in OperationDataKey<TEntityTypeKey>]: P extends `${Uncapitalize<TEntityTypeKey>}List`
      ? typeof itemList
      : P extends `${Uncapitalize<Operation.Push>}${TEntityTypeKey}List`
        ? typeof pushItemList
        : P extends `${Uncapitalize<Operation.Create>}${TEntityTypeKey}`
          ? typeof createItem
          : P extends `${Uncapitalize<Operation.Update>}${TEntityTypeKey}`
            ? typeof updateItem
            : P extends `${Uncapitalize<Operation.Delete>}${TEntityTypeKey}`
              ? typeof deleteItem
              : never;
  };
};
