import type { SerializableValue } from "@/models/azure/SerializableValue";
import type { FilterType } from "@/models/message/filter/FilterType";

import { serializableValueSchema } from "@/models/azure/SerializableValue";
import { filterTypeSchema } from "@/models/message/filter/FilterType";
import { z } from "zod";

export interface Filter {
  type: FilterType;
  value: SerializableValue;
}

export const filterSchema: z.ZodType<Filter> = z.object({
  type: filterTypeSchema,
  value: serializableValueSchema,
});
