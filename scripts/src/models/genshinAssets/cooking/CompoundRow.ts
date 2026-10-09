// The fields read off one row of the game's compound table, the processing of ingredients over time: its id, the time one
// Unit takes in seconds, its inputs and outputs with their counts, how many of it may be queued, its rank, its type, and
// Whether it is known from the start
export interface CompoundRow {
  costTime: number;
  id: number;
  inputVec: { count: number; id: number }[];
  isDefaultUnlocked: boolean;
  outputVec: { count: number; id: number }[];
  queueSize: number;
  rankLevel: number;
  type: string;
}
