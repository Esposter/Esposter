// @unocss-include
import type { SearchFilterOption } from "@/models/message/filter/SearchFilterOption";

import { FilterTypeHasIconMap } from "@/services/message/FilterTypeHasIconMap";
import { FilterTypeHases } from "@esposter/db-schema";

export const HAS_FILTER_OPTIONS: SearchFilterOption[] = FilterTypeHases.map((filterTypeHas) => ({
  icon: FilterTypeHasIconMap[filterTypeHas],
  label: filterTypeHas,
  value: filterTypeHas,
}));

export const PIN_FILTER_OPTIONS: SearchFilterOption[] = [
  { icon: "i-mdi:pin", label: "true", value: true },
  { icon: "i-mdi:pin-off", label: "false", value: false },
];
