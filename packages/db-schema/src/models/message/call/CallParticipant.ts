import type { UserInAuth } from "#src/schema/auth/usersInAuth";

import { sessionIdSchema } from "#src/models/shared/SessionId";
import { userIdSchema } from "#src/models/shared/UserId";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { z } from "zod";

export interface CallParticipant extends Pick<UserInAuth, "name"> {
  id: string;
  image: UserInAuth["image"];
  isCameraEnabled: boolean;
  isHandRaised: boolean;
  isMuted: boolean;
  userId: UserInAuth["id"];
}

export const callParticipantSchema = z.object({
  id: sessionIdSchema.shape.sessionId,
  image: selectUserInAuthSchema.shape.image,
  isCameraEnabled: z.boolean(),
  isHandRaised: z.boolean(),
  isMuted: z.boolean(),
  name: selectUserInAuthSchema.shape.name,
  ...userIdSchema.shape,
}) satisfies z.ZodType<CallParticipant>;
