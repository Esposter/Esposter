import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { CompositeKey } from "#shared/models/azure/CompositeKey";
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
  const createItem = (newItem: TItem, isReversed?: true) => {
    if (isReversed) itemList.value.unshift(newItem);
    else itemList.value.push(newItem);
  };
  const updateItem = (updatedItem: Partial<TItem>) => {
    const index = itemList.value.findIndex(
      ({ partitionKey, rowKey }) => partitionKey === updatedItem.partitionKey && rowKey === updatedItem.rowKey,
    );
    if (index === -1) return;

    Object.assign(itemList.value[index], updatedItem);
  };
  const deleteItem = ({ partitionKey, rowKey }: CompositeKey) => {
    itemList.value = itemList.value.filter((i) => !(i.partitionKey === partitionKey && i.rowKey === rowKey));
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
