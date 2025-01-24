import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export interface ItemEntityType<T extends string> {
  type: T;
}

export const ItemEntityTypePropertyNames = getPropertyNames<ItemEntityType<string>>();

export const createItemEntityTypeSchema = <T extends z.ZodType<string>>(schema: T) => z.object({ type: schema });
