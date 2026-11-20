import type { InviteInMessage, InviteInMessageWithCreator } from "@esposter/db-schema";

// A create's answer: the link it issued, and the links of the same member it replaced, which the server answers as
// Tombstones at their new versions so every reader drops them with it
export interface CreateInviteResult {
  invite: InviteInMessageWithCreator;
  replacedInvites: InviteInMessage[];
}
