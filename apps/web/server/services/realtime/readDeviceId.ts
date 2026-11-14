import { DEVICE_ID_HEADER, deviceIdSchema } from "#shared/models/realtime/DeviceId";

// The browser tab a write came from, as the page named it in the device header. A missing or malformed header names no
// Tab, so the write's echo reaches every socket and the client absorbs it by id
export const readDeviceId = (headers: Headers): string => {
  const { data, success } = deviceIdSchema.safeParse({ deviceId: headers.get(DEVICE_ID_HEADER) });
  return success ? data.deviceId : "";
};
