import type { CallParticipant } from "@esposter/db-schema";
import type { Session, User } from "better-auth";

export const createParticipant = (
  session: Pick<Session, "id">,
  user: Pick<User, "id" | "image" | "name">,
): CallParticipant => ({
  id: session.id,
  image: user.image ?? "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: user.name,
  userId: user.id,
});
