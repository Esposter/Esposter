import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

export const createParticipant = (
  session: { id: string },
  user: { id: string; image?: null | string; name: string },
): CallParticipant => ({
  id: session.id,
  image: user.image ?? null,
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: user.name,
  userId: user.id,
});
