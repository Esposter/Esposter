import type { PublicUser } from "#src/models/user/PublicUser";
import type { BanInMessage } from "#src/schema/message/bansInMessage";

export type BanInMessageWithUsers = { bannedByUser: null | PublicUser; user: PublicUser } & BanInMessage;
