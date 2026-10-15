// @unocss-include
import type { SearchFilterOption } from "@/models/message/filter/SearchFilterOption";

import { FilterTypeHasIconMap } from "@/services/message/FilterTypeHasIconMap";
import { FilterTypeAuthorType, FilterTypeAuthorTypes, FilterTypeHases } from "@esposter/db-schema";

const FilterTypeAuthorTypeIconMap = {
  [FilterTypeAuthorType.User]: "i-mdi:account",
  [FilterTypeAuthorType.Webhook]: "i-mdi:webhook",
} satisfies Record<FilterTypeAuthorType, string>;

export const AUTHOR_TYPE_FILTER_OPTIONS: SearchFilterOption[] = FilterTypeAuthorTypes.map((authorType) => ({
  icon: FilterTypeAuthorTypeIconMap[authorType],
  label: authorType,
  value: authorType,
}));

export const HAS_FILTER_OPTIONS: SearchFilterOption[] = FilterTypeHases.map((filterTypeHas) => ({
  icon: FilterTypeHasIconMap[filterTypeHas],
  label: filterTypeHas,
  value: filterTypeHas,
}));

export const PIN_FILTER_OPTIONS: SearchFilterOption[] = [
  { icon: "i-mdi:pin", label: "true", value: true },
  { icon: "i-mdi:pin-off", label: "false", value: false },
];
