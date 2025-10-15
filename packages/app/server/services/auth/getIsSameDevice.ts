import type { DeviceId } from "#shared/models/auth/DeviceId";
import type { Session } from "#shared/models/auth/Session";

export const getIsSameDevice = (deviceId: DeviceId, session: Session) =>
  deviceId.sessionId === session.session.id && deviceId.userId === session.user.id;
