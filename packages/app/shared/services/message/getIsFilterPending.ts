import type { Filter } from "@esposter/db-schema";

// A filter the user has added but not yet given a value to. Its "" is the absent-value sentinel — not a valid
// SerializableValue — so it constrains nothing and can never be sent. The test is for that sentinel rather than
// For falsiness because `pinned: false` is a value the user picked, and a truthiness test read it as pending.
export const getIsFilterPending = ({ value }: Filter) => value === "";
