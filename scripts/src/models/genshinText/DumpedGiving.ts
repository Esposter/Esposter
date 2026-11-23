// One row of the game's giving table, a delivery the Traveler hands over: its id, which a delivery quest shares, and
// The Items it asks for, each with its count, the list padded with empty entries the dump leaves in, which read with a
// Zero Id. A giving by group asks for `givingGroupCount` of the items of the groups it names, and leaves its exact
// Items empty
export interface DumpedGiving {
  exactItems: { count: number; id: number }[];
  givingGroupCount?: number;
  givingGroupIds?: number[];
  id: number;
}
