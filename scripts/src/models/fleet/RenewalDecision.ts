// Whether a hold keeps its claim: renewed, or stopped because the claim is gone, missed, held by another worker, or
// Moved between the read and the renewal's push
export enum RenewalDecision {
  Deleted = "Deleted",
  Missed = "Missed",
  Moved = "Moved",
  Renew = "Renew",
  TakenOver = "TakenOver",
}
