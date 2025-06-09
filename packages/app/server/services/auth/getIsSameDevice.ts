import type { DeviceId } from "@@/server/models/auth/DeviceId";
import type { Session } from "@@/server/models/auth/Session";

export const getIsSameDevice = (deviceId: DeviceId, session: Session) =>
  deviceId.sessionId === session.session.id && deviceId.userId === session.user.id;
