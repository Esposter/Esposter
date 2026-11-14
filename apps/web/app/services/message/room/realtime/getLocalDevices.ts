export const getLocalDevices = async (kind: MediaDeviceKind) =>
  (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === kind);
