// One row of the game's giving table, a delivery the Traveler hands over: its id, which a delivery quest shares, and the
// Items it asks for, each with its count, the list padded with empty entries the dump leaves in
export interface DumpedGiving {
  exactItems: { count?: number; id?: number }[];
  id: number;
}
