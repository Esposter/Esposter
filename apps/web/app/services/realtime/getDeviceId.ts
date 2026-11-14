// The browser tab this page is, minted once per page load. Its sockets and its requests name it, so the server can leave
// the tab out of the echo of its own write
let deviceId = "";

export const getDeviceId = (): string => {
  deviceId ||= crypto.randomUUID();
  return deviceId;
};
