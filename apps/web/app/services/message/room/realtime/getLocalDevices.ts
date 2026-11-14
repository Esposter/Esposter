export const getLocalDevices = async (kind: MediaDeviceKind) =>
  (await window.navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === kind);
