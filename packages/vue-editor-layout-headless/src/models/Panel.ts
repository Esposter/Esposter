import type { Condition } from "#src/models/Condition";

// A panel belongs to one region and is shown under its condition
// Its content is the one its table names for the selection kind, and the wildcard content for any kind the table has no entry for
export interface Panel {
  condition: Condition;
  id: string;
  regionId: string;
  // The content key for each selection kind the panel has an entry for
  selectionKindContentKeyMap: Record<string, string>;
  // The content key for every other selection kind, "" when the panel has no wildcard
  wildcardContentKey: string;
}
