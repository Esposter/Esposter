import type { EntityIdKeys } from "#src/models/entity/EntityIdKeys";
import type { EntityIds } from "#src/models/entity/EntityIds";
import type { OperationDataKey } from "#src/models/shared/pagination/OperationDataKey";
import type { EntityTypeKey } from "@esposter/db-schema";

import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { omitUndefined, Operation, takeOne, uncapitalize } from "@esposter/shared";

export const createOperationData = <
  TItem extends object,
  // The id keys are also keys of TItem.
  // The EntityIdKeys type alone does not say so for a generic TItem, since it stays a deferred conditional.
  // `TIdKeys` is inferred from `idKeys`.
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- so a caller's tuple keeps its literal keys
  TIdKeys extends (keyof TItem & string)[] & EntityIdKeys<TItem>,
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
    const checkIsNewItem = getEntityIdEqualComparator<TItem, TIdKeys[number]>(idKeys, newItem);
    // Guard against duplicate delivery from transport reconnections (e.g. SSE Last-Event-ID catch-up
    // Re-yielding stored events).
    if (items.value.some((item) => checkIsNewItem(item))) return;
    else if (isReversed) items.value.unshift(newItem);
    else items.value.push(newItem);
  };
  // A field handed undefined is not set, so it leaves the stored value as it was
  const updateItem = (updatedItem: { [P in keyof TItem]?: TItem[P] | undefined }) => {
    // Built once and then searched with, rather than inside the callback: the comparator closes over the
    // Target, so constructing it per element rebuilds the same predicate for every row in the list
    const checkIsUpdatedItem = getEntityIdEqualComparator<TItem, TIdKeys[number]>(idKeys, updatedItem);
    const index = items.value.findIndex((item) => checkIsUpdatedItem(item));
    if (index === -1) return;

    Object.assign(takeOne(items.value, index), omitUndefined(updatedItem));
  };
  const deleteItem = (ids: EntityIds<TItem, TIdKeys>) => {
    const checkIsDeletedItem = getEntityIdEqualComparator<TItem, TIdKeys[number]>(idKeys, ids);
    items.value = items.value.filter((item) => !checkIsDeletedItem(item));
  };
  // The keys are template strings the compiler reads as string.
  // So the mapped type restates which key holds which operation's function.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- no key reaches its function in the mapped type
  return {
    [`${uncapitalize(entityTypeKey)}s`]: items,
    [`${uncapitalize(Operation.Create)}${entityTypeKey}`]: createItem,
    [`${uncapitalize(Operation.Delete)}${entityTypeKey}`]: deleteItem,
    [`${uncapitalize(Operation.Push)}${entityTypeKey}s`]: pushItems,
    [`${uncapitalize(Operation.Unshift)}${entityTypeKey}s`]: unshiftItems,
    [`${uncapitalize(Operation.Update)}${entityTypeKey}`]: updateItem,
  } as {
    [P in OperationDataKey<TEntityTypeKey>]: P extends `${Uncapitalize<typeof Operation.Push>}${TEntityTypeKey}s`
      ? typeof pushItems
      : P extends `${Uncapitalize<typeof Operation.Unshift>}${TEntityTypeKey}s`
        ? typeof unshiftItems
        : P extends `${Uncapitalize<typeof Operation.Create>}${TEntityTypeKey}`
          ? typeof createItem
          : P extends `${Uncapitalize<typeof Operation.Update>}${TEntityTypeKey}`
            ? typeof updateItem
            : P extends `${Uncapitalize<typeof Operation.Delete>}${TEntityTypeKey}`
              ? typeof deleteItem
              : never;
  };
};
