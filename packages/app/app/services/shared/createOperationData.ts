import type { AEntity } from "#shared/models/entity/AEntity";
import type { EntityIdKeys } from "#shared/models/entity/EntityIdKeys";
import type { ToData } from "#shared/models/entity/ToData";
import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { OperationDataKey } from "@/models/shared/pagination/OperationDataKey";

import { getEntityIdComparator } from "#shared/services/entity/getEntityIdComparator";
import { Operation, uncapitalize } from "@esposter/shared";

export const createOperationData = <
  TItem extends ToData<AEntity>,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TIdKeys extends EntityIdKeys<TItem>,
  TEntityTypeKey extends EntityTypeKey,
>(
  items: Ref<TItem[]>,
  idKeys: [...TIdKeys],
  entityTypeKey: TEntityTypeKey,
) => {
  const pushItems = (...newItems: TItem[]) => {
    items.value.push(...newItems);
  };
  const unshiftItems = (...newItems: TItem[]) => {
    items.value.unshift(...newItems);
  };
  const createItem = (newItem: TItem, isReversed?: true) => {
    if (isReversed) items.value.unshift(newItem);
    else items.value.push(newItem);
  };
  const updateItem = (updatedItem: Partial<TItem>) => {
    const index = items.value.findIndex(getEntityIdComparator(idKeys, updatedItem));
    if (index === -1) return;

    Object.assign(items.value[index], updatedItem);
  };
  const deleteItem = (ids: { [P in keyof TItem & TIdKeys[number]]: TItem[P] }) => {
    items.value = items.value.filter((i) => !getEntityIdComparator(idKeys, ids)(i));
  };
  return {
    [`${uncapitalize(entityTypeKey)}s`]: items,
    [`${uncapitalize(Operation.Create)}${entityTypeKey}`]: createItem,
    [`${uncapitalize(Operation.Delete)}${entityTypeKey}`]: deleteItem,
    [`${uncapitalize(Operation.Push)}${entityTypeKey}s`]: pushItems,
    [`${uncapitalize(Operation.Unshift)}${entityTypeKey}s`]: unshiftItems,
    [`${uncapitalize(Operation.Update)}${entityTypeKey}`]: updateItem,
  } as {
    [P in OperationDataKey<TEntityTypeKey>]: P extends `${Uncapitalize<Operation.Push>}${TEntityTypeKey}s`
      ? typeof pushItems
      : P extends `${Uncapitalize<Operation.Unshift>}${TEntityTypeKey}s`
        ? typeof unshiftItems
        : P extends `${Uncapitalize<Operation.Create>}${TEntityTypeKey}`
          ? typeof createItem
          : P extends `${Uncapitalize<Operation.Update>}${TEntityTypeKey}`
            ? typeof updateItem
            : P extends `${Uncapitalize<Operation.Delete>}${TEntityTypeKey}`
              ? typeof deleteItem
              : never;
  };
};
