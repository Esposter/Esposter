import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { ToData } from "#shared/models/entity/ToData";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { OperationDataKey } from "@/models/shared/pagination/OperationDataKey";

import { getEntityIdComparator } from "#shared/services/entity/getEntityIdComparator";
import { uncapitalize } from "@/util/text/uncapitalize";
import { Operation } from "@esposter/shared";

export const createOperationData = <
  TItem extends ToData<AEntity>,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TIdKeys extends EntityIdKeys<TItem>,
  TEntityTypeKey extends EntityTypeKey,
>(
  itemList: Ref<TItem[]>,
  idKeys: [...TIdKeys],
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
    const index = itemList.value.findIndex(getEntityIdComparator(idKeys, updatedItem));
    if (index === -1) return;

    Object.assign(itemList.value[index], updatedItem);
  };
  const deleteItem = (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    itemList.value = itemList.value.filter((i) => !getEntityIdComparator(idKeys, ids)(i));
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
