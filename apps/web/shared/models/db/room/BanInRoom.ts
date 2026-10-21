import type { MemberInRoom } from "#shared/models/db/room/MemberInRoom";
import type { BanInMessageWithUsers } from "@esposter/db-schema";
import type { Except } from "type-fest";

// A ban whose banner and banned user carry the name each one has in the room the ban is in
export interface BanInRoom extends Except<BanInMessageWithUsers, "bannedByUser" | "user"> {
  bannedByUser: MemberInRoom | null;
  user: MemberInRoom;
}
