import type { Session, User } from "better-auth";

import { selectUserInAuthSchema, sessionIdSchema, userIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export interface CallParticipant extends Pick<User, "image" | "name"> {
  id: Session["id"];
  isCameraEnabled: boolean;
  isHandRaised: boolean;
  isMuted: boolean;
  userId: User["id"];
}

export const callParticipantSchema = z.object({
  id: sessionIdSchema.shape.sessionId,
  image: selectUserInAuthSchema.shape.image.nullable(),
  isCameraEnabled: z.boolean(),
  isHandRaised: z.boolean(),
  isMuted: z.boolean(),
  name: selectUserInAuthSchema.shape.name,
  ...userIdSchema.shape,
}) satisfies z.ZodType<CallParticipant>;
