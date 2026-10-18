// One row of the game's giving table, a delivery the Traveler hands over: its id, which a delivery quest shares, and how
// It asks. By exact items, each with its count, the list padded with empty entries the dump leaves in, which read with a
// Zero id; or by a food group, any one item of the groups it names, the count the row gives
export interface DumpedGiving {
  exactItems: { count: number; id: number }[];
  givingGroupCount?: number;
  givingGroupIds?: number[];
  givingMethod: string;
  id: number;
}
