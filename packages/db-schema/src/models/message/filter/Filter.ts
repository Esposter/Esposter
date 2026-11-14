import type { FilterType } from "#src/models/message/filter/FilterType";
import type { SerializableValue } from "#src/models/streams/SerializableValue";

import { filterTypeSchema } from "#src/models/message/filter/FilterType";
import { serializableValueSchema } from "#src/models/streams/SerializableValue";
import { z } from "zod";

export interface Filter {
  type: FilterType;
  value: SerializableValue;
}

export const filterSchema = z.object({
  type: filterTypeSchema,
  value: serializableValueSchema,
}) satisfies z.ZodType<Filter>;
