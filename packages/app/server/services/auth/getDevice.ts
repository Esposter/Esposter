import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

export const getDevice = ({ session, user }: GetSessionPayload) => ({ sessionId: session.id, userId: user.id });
