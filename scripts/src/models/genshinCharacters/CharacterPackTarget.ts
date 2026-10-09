// The accounts a publish stores a pack's files in: one of them, or both, which alone writes the pack into the lock
export enum CharacterPackTarget {
  Both = "both",
  Dev = "dev",
  Prod = "prod",
}
