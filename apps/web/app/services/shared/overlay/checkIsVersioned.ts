import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// Narrows a view row to one that holds a version. A placeholder a store draws carries NO_ROW_VERSION rather than none, so
// A row with no version at all is one the view has no server state for, and a store that types its rows whole leaves it out
export const checkIsVersioned = <TRow extends Draft<Versioned>>(row: TRow): row is TRow & Versioned =>
  row.version !== undefined;
