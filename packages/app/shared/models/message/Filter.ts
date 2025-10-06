import type { FilterType } from "#shared/models/message/FilterType";
import type { SerializableValue } from "@esposter/shared";

import { serializableValueSchema } from "#shared/models/azure/SerializableValue";
import { filterTypeSchema } from "#shared/models/message/FilterType";
import { z } from "zod";

export interface Filter {
  type: FilterType;
  value: SerializableValue;
}

export const filterSchema = z.object({
  type: filterTypeSchema,
  value: serializableValueSchema,
});
