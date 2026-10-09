import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

// The message of a claim commit. `renewedAt` is what staleness reads, and a `miss` is the holder's final word on an
// Entry it could not complete: a missed claim is never taken over, so the entry waits for the coordinator's call.
// A claim without a `worker` predates workers, and parses as worker ""
export interface ClaimMessage extends ClaimHolder {
  claimedAt: string;
  entry: string;
  load: string;
  miss?: string;
  renewedAt: string;
}
