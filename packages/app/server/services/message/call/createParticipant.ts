import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { nullToUndefined } from "@esposter/shared";

// `user.image` arrives as the Drizzle/better-auth `string | null` boundary shape; convert it to the
// App-owned `undefined` sentinel on ingress before it enters CallParticipant.
export const createParticipant = (
  session: { id: string },
  user: { id: string; image?: null | string; name: string },
): CallParticipant => ({
  id: session.id,
  image: nullToUndefined(user.image),
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: user.name,
  userId: user.id,
});
