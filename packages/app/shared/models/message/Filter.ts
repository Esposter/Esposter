import type { FilterType } from "#shared/models/message/FilterType";

import { filterTypeSchema } from "#shared/models/message/FilterType";
import { FILTER_VALUE_MAX_LENGTH } from "#shared/services/message/constants";
import { z } from "zod";

export interface Filter {
  type: FilterType;
  value: string;
}

export const filterSchema = z.object({
  type: filterTypeSchema,
  value: z.string().min(1).max(FILTER_VALUE_MAX_LENGTH),
});
