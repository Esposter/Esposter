import { v7 } from "uuid";

// The browser tab this page is, minted once per page load. Its sockets and its requests name it, so the server can leave
// The tab out of the echo of its own write
let deviceId = "";

export const getDeviceId = (): string => {
  deviceId ||= v7();
  return deviceId;
};
