// What one forge queue holds: nothing, an order still forging, an order done and waiting to be collected, or a queue the
// Player's Adventure Rank has not opened yet
export enum ForgeQueueState {
  Complete = "Complete",
  Forging = "Forging",
  Idle = "Idle",
  Locked = "Locked",
}
