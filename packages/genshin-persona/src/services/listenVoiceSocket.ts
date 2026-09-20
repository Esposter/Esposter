import type { Server } from "node:net";

import { checkIsVoiceServerRunning } from "#src/services/checkIsVoiceServerRunning";
import { VOICE_SOCKET_PATH } from "#src/services/constants";
import { rmSync } from "node:fs";

// The server bound to the one address, or false when another server holds it — the race between two hooks that
// Each spawned one leaves exactly one. A socket file nothing answers on is a server killed without cleanup, and
// Is removed before binding; a named pipe leaves no file behind
export const listenVoiceSocket = async (server: Server): Promise<boolean> => {
  const listen = () =>
    new Promise<boolean>((resolve) => {
      server.once("error", () => {
        resolve(false);
      });
      server.listen(VOICE_SOCKET_PATH, () => {
        resolve(true);
      });
    });
  if (await listen()) return true;
  if (process.platform === "win32" || (await checkIsVoiceServerRunning())) return false;

  rmSync(VOICE_SOCKET_PATH, { force: true });
  return listen();
};
