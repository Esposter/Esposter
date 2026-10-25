import type { Filter } from "@esposter/db-schema";

import { checkIsFilterPending } from "#shared/services/message/checkIsFilterPending";
import { getDisplayValue } from "@/services/message/filter/getDisplayValue";
import { getFilterKeyword } from "@/services/message/filter/getFilterKeyword";

export const getFilterDisplayValue = (filter: Filter) => {
  const { type, value } = filter;
  const filterKeyword = getFilterKeyword(type);
  if (checkIsFilterPending(filter)) return filterKeyword;

  const displayValue = getDisplayValue(type, value, getFilterDisplayValue.name);
  return `${filterKeyword} ${displayValue}`;
};
