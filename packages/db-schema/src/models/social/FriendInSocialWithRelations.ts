import type { PublicUser } from "#src/models/user/PublicUser";
import type { FriendInSocial } from "#src/schema/social/friendsInSocial";

export type FriendInSocialWithRelations = { receiver: PublicUser; sender: PublicUser } & FriendInSocial;
