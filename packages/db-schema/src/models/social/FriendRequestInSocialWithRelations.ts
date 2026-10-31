import type { PublicUser } from "#src/models/user/PublicUser";
import type { FriendRequestInSocial } from "#src/schema/social/friendRequestsInSocial";

export type FriendRequestInSocialWithRelations = FriendRequestInSocial & { sender: PublicUser };
