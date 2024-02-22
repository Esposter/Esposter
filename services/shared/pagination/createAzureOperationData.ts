import type { AzureEntity, CompositeKey } from "@/models/azure";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import { Operation } from "@/models/shared/pagination/Operation";
import type { OperationDataKey } from "@/models/shared/pagination/OperationDataKey";
import { uncapitalize } from "@/util/text/uncapitalize";

export const createAzureOperationData = <TItem extends AzureEntity, TEntityTypeKey extends EntityTypeKey = "Item">(
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
    const index = itemList.value.findIndex(
      (i) => i.partitionKey === updatedItem.partitionKey && i.rowKey === updatedItem.rowKey,
    );
    if (index > -1) itemList.value[index] = { ...itemList.value[index], ...updatedItem, updatedAt: new Date() };
  };
  const deleteItem = ({ partitionKey, rowKey }: CompositeKey) => {
    itemList.value = itemList.value.filter((i) => !(i.partitionKey === partitionKey && i.rowKey === rowKey));
  };
  return {
    [`${uncapitalize(entityTypeKey)}List`]: itemList,
    [`${Operation.push}${entityTypeKey}List`]: pushItemList,
    [`${Operation.create}${entityTypeKey}`]: createItem,
    [`${Operation.update}${entityTypeKey}`]: updateItem,
    [`${Operation.delete}${entityTypeKey}`]: deleteItem,
  } as {
    [P in OperationDataKey<TEntityTypeKey>]: P extends `${Uncapitalize<TEntityTypeKey>}List`
      ? typeof itemList
      : P extends `${Operation.push}${TEntityTypeKey}List`
        ? typeof pushItemList
        : P extends `${Operation.create}${TEntityTypeKey}`
          ? typeof createItem
          : P extends `${Operation.update}${TEntityTypeKey}`
            ? typeof updateItem
            : P extends `${Operation.delete}${TEntityTypeKey}`
              ? typeof deleteItem
              : never;
  };
};
