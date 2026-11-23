import type { PublicUser } from "#src/models/user/PublicUser";
import type { FriendRequestInSocial } from "#src/schema/social/friendRequestsInSocial";

import { publicUserSchema } from "#src/models/user/PublicUser";
import { selectFriendRequestInSocialSchema } from "#src/schema/social/friendRequestsInSocial";
import { z } from "zod";

export type FriendRequestInSocialWithRelations = { sender: PublicUser } & FriendRequestInSocial;

export const friendRequestInSocialWithRelationsSchema = z.object({
  ...selectFriendRequestInSocialSchema.shape,
  sender: publicUserSchema,
}) satisfies z.ZodType<FriendRequestInSocialWithRelations>;
