// The one spelling of the tag a device's sockets are accepted under, so a broadcast names or skips them alike
export const getDeviceSocketTag = (deviceId: string): string => `device:${deviceId}`;
