import type { InviteInMessage, RoomInMessage, User, UserToRoomInMessage } from "@esposter/db-schema";

// The invite a token resolves to, plus whether the reader is already in the room it names — the landing page
// Needs both to decide between "Join" and "Open", and a second read for the membership would be a round trip
// For a boolean this one already knows. The room rides along with its membership rows because the page renders
// The room's name and member count beside the decision.
export interface ReadInviteResult extends InviteInMessage {
  isMember: boolean;
  roomInMessage: RoomInMessage & { usersToRoomsInMessage: UserToRoomInMessage[] };
  user: User;
}
