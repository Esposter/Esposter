import type { PropertyNames } from "@/util/types/PropertyNames";

import { getPropertyNames } from "@/util/object/getPropertyNames";
import { z } from "zod";

export interface ItemEntityType<T extends string> {
  type: T;
}

export const ItemEntityTypePropertyNames: PropertyNames<ItemEntityType<string>> =
  getPropertyNames<ItemEntityType<string>>();

export const createItemEntityTypeSchema = <T extends z.ZodType<string>>(schema: T): z.ZodObject<{ type: T }> =>
  z.object({ type: schema });
