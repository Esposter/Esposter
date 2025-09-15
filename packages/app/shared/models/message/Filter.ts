import type { FilterType } from "#shared/models/message/FilterType";

import { filterTypeSchema } from "#shared/models/message/FilterType";
import { FILTER_KEY_MAX_LENGTH, FILTER_VALUE_MAX_LENGTH } from "#shared/services/message/constants";
import { z } from "zod";

export interface Filter {
  key: string;
  type: FilterType;
  value: string;
}

export const filterSchema = z.object({
  key: z.string().min(1).max(FILTER_KEY_MAX_LENGTH),
  type: filterTypeSchema,
  value: z.string().min(1).max(FILTER_VALUE_MAX_LENGTH),
});
