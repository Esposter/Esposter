// The units of one recipe a queue holds and has not yet collected: how many, the seconds each takes as the order was started
// (its recipe's, less any talent's share), and the moment the first of them began. Each unit takes those seconds after the
// One before it, so the units done by a moment are read from that start. A unit done but not yet collected still counts
export interface ForgeOrder {
  count: number;
  recipeId: number;
  startedAt: Temporal.Instant;
  unitSeconds: number;
}
