import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { Except } from "type-fest";

import { userIdSchema } from "#src/models/shared/UserId";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { z } from "zod";

// A connection's place in one call, named to the call's members by a fresh id each join or knock. It names the
// Participant in that call alone: the auth session it joined under is never part of it
export interface CallParticipant extends Pick<UserInAuth, "name"> {
  id: string;
  image: UserInAuth["image"];
  isCameraEnabled: boolean;
  isHandRaised: boolean;
  isMuted: boolean;
  userId: UserInAuth["id"];
}

// A connection's profile before the call names it: the participant in every field but the id the call mints for it
export type CallParticipantProfile = Except<CallParticipant, "id">;

export const callParticipantSchema = z.object({
  id: z.uuidv7(),
  image: selectUserInAuthSchema.shape.image,
  isCameraEnabled: z.boolean(),
  isHandRaised: z.boolean(),
  isMuted: z.boolean(),
  name: selectUserInAuthSchema.shape.name,
  ...userIdSchema.shape,
}) satisfies z.ZodType<CallParticipant>;
