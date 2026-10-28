import type { ClaimMessage } from "#src/models/fleet/ClaimMessage";

// A claim ref as fetched: the commit it points at, and the message that commit carries
export interface ClaimedRef {
  message: ClaimMessage;
  sha: string;
}
