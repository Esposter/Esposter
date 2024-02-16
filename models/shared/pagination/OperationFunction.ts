import { type AItemEntity } from "@/models/shared/AItemEntity";
import { type Operation } from "@/models/shared/pagination/Operation";

export type OperationFunction<TItem extends Pick<AItemEntity, "id">> = {
  [Operation.push]: (...items: TItem[]) => void;
  [Operation.create]: (newItem: TItem) => void;
  [Operation.update]: (updatedItem: TItem) => void;
  [Operation.delete]: (id: TItem["id"]) => void;
  [key: string]: unknown;
};
