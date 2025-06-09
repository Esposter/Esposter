import type { DeviceId } from "@@/server/models/auth/DeviceId";

export const getIsSameDevice = (deviceId1: DeviceId, deviceId2: DeviceId) =>
  deviceId1.sessionId === deviceId2.sessionId && deviceId1.userId === deviceId2.userId;
