import type { Device } from "#shared/models/auth/Device";
import type { Session } from "#shared/models/auth/Session";

import { getDeviceId } from "@@/server/services/auth/getDeviceId";

export const getIsSameDevice = (device: Device, { session, user }: Session) =>
  getDeviceId(device) === getDeviceId({ sessionId: session.id, userId: user.id });
