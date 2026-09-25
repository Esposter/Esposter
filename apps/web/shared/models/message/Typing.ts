import type { User, UserToRoomInMessage } from "@esposter/db-schema";

export interface Typing extends Pick<UserToRoomInMessage, "roomId" | "userId"> {
  // The name the room knows the typist by, resolved by the server from the typist's own row
  username: User["name"];
}
