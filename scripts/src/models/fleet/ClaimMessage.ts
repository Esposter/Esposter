// The message of a claim commit. `renewedAt` is what staleness reads, and a `miss` is the holder's final word on an
// Entry it could not complete: a missed claim is never taken over, so the entry waits for the coordinator's call
export interface ClaimMessage {
  claimedAt: string;
  entry: string;
  load: string;
  machine: string;
  miss?: string;
  renewedAt: string;
}
