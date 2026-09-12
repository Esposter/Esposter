import type { SerializableValue } from "@esposter/azure";

// One choice a search-filter picker offers: what it draws, what it says, and the value the filter takes.
export interface SearchFilterOption {
  icon: string;
  label: string;
  value: SerializableValue;
}
