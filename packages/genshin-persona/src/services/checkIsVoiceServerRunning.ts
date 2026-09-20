import { VOICE_SOCKET_PATH } from "#src/services/constants";
import { createConnection } from "node:net";

// Whether something answers at the address: a socket file a server was killed without removing is bound to
// Nothing, and is removed before a new server binds it
export const checkIsVoiceServerRunning = (): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = createConnection(VOICE_SOCKET_PATH);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => {
      resolve(false);
    });
  });
