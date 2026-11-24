import type { CallParticipantProfile } from "@esposter/db-schema";
import type { User } from "better-auth";

// A connection's profile in a call.
// The call object names the connection by an id of its own, minted by its join or knock.
export const createParticipant = (user: Pick<User, "id" | "image" | "name">): CallParticipantProfile => ({
  image: user.image ?? "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: user.name,
  userId: user.id,
});
