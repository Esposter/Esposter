import type { InviteInMessage, PublicUser, RoomInMessage } from "@esposter/db-schema";

// The invite a token resolves to, plus whether the reader is already in the room it names — the landing page
// Needs both to decide between "Join" and "Open", and a second read for the membership would be a round trip
// For a boolean this one already knows. The room rides along with its member count, which is all the page renders
// Beside the decision: the membership rows stay unread, since anyone holding the code reads this
export interface ReadInviteResult extends InviteInMessage {
  isMember: boolean;
  room: RoomInMessage & { memberCount: number };
  user: PublicUser;
}
