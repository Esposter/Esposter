// The units of one recipe a queue holds and has not yet collected: how many, and the moment the first of them began. Each
// Unit takes its recipe's seconds after the one before it, so the units done by a moment are read from that start. A unit
// Done but not yet collected still counts
export interface ForgeOrder {
  count: number;
  recipeId: number;
  startedAt: Temporal.Instant;
}
