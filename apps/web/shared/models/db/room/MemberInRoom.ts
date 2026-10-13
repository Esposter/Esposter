import type { PublicUser } from "@esposter/db-schema";

// A member as a room lists them: the user's public columns plus the name the room shows and sorts them by
export interface MemberInRoom extends PublicUser {
  displayName: string;
}
