// What one tool call does to the count of lookups in a row: a lookup adds one, a reset clears it, and a call that
// Neither is, or a subagent's, leaves it as it was
export enum DelegationStep {
  Lookup = "Lookup",
  Neutral = "Neutral",
  Reset = "Reset",
}
