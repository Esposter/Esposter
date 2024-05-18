import type { AzureEntity, CompositeKey } from "@/models/azure";
import type { AzureEntityType } from "@/models/shared/entity/AzureEntityType";
import type { OperationDataKey } from "@/models/shared/pagination/OperationDataKey";
import { uncapitalize } from "@/util/text/uncapitalize";
import { Operation } from "@esposter/shared";

export const createAzureOperationData = <TItem extends AzureEntity, TEntityTypeKey extends AzureEntityType>(
  itemList: Ref<TItem[]>,
  entityTypeKey: TEntityTypeKey,
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
    [`${uncapitalize(Operation.Push)}${entityTypeKey}List`]: pushItemList,
    [`${uncapitalize(Operation.Create)}${entityTypeKey}`]: createItem,
    [`${uncapitalize(Operation.Update)}${entityTypeKey}`]: updateItem,
    [`${uncapitalize(Operation.Delete)}${entityTypeKey}`]: deleteItem,
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
