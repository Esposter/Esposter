import type { FilterType } from "@/models/message/filter/FilterType";
import type { SerializableValue } from "@esposter/azure";

import { filterTypeSchema } from "@/models/message/filter/FilterType";
import { serializableValueSchema } from "@esposter/azure";
import { z } from "zod";

export interface Filter {
  type: FilterType;
  value: SerializableValue;
}

export const filterSchema = z.object({
  type: filterTypeSchema,
  value: serializableValueSchema,
}) satisfies z.ZodType<Filter>;
