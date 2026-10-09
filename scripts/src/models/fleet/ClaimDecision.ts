// What a worker does with an entry's claim as read: adopts its own, leaves a live one held by another worker, or takes
// The entry, which is free or stale
export enum ClaimDecision {
  Adopt = "Adopt",
  Held = "Held",
  Take = "Take",
}
