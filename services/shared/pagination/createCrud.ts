import { type AItemEntity } from "@/models/shared/AItemEntity";
import { type Entity } from "~/models/shared/Entity";
import { type EntityValue } from "~/models/shared/EntityValue";
import { Operation } from "~/models/shared/pagination/Operation";

type OperationKey<TEntity extends EntityValue> = `${Operation.push}${TEntity}List` | Exclude<Operation, Operation.push>;

export const createOperations = <TItem extends Pick<AItemEntity, "id">, TEntity extends Entity[keyof Entity] & string>(
  itemList: Ref<TItem[]>,
  entity: TEntity,
) => {
  const pushItemList = (...items: TItem[]) => {
    itemList.value.push(...items);
  };
  const createItem = (newItem: TItem) => {
    itemList.value.push(newItem);
  };
  const updateItem = (updatedItem: TItem) => {
    const index = itemList.value.findIndex((s) => s.id === updatedItem.id);
    if (index > -1) itemList.value[index] = { ...itemList.value[index], ...updatedItem };
  };
  const deleteItem = (id: TItem["id"]) => {
    itemList.value = itemList.value.filter((i) => i.id !== id);
  };
  return {
    [`${Operation.push}${entity}List`]: pushItemList,
    [`${Operation.create}${entity}`]: createItem,
    [`${Operation.update}${entity}`]: updateItem,
    [`${Operation.delete}${entity}`]: deleteItem,
  } as {
    [P in OperationKey<TEntity>]: P extends Operation.push ? typeof pushItemList : never;
  };
};
