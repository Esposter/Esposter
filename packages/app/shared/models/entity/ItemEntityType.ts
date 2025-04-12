import { getPropertyNames } from "#shared/util/getPropertyNames";
import { type } from "arktype";

export interface ItemEntityType<T extends string> {
  type: T;
}

export const ItemEntityTypePropertyNames = getPropertyNames<ItemEntityType<string>>();

export const createItemEntityTypeSchema = <T extends string>(schema: type.Any<T>) => type({ type: schema });
