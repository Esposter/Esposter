import { TOKEN_QUERY_PARAMETER } from "#src/services/constants";
import { HOST_PROBE_TIMEOUT_MS } from "#src/services/server/constants";
import { getResultAsync } from "@esposter/shared";
import { once } from "node:events";
import { WebSocket } from "ws";

// Whether an Esposter host holds the address: only one accepts a connection carrying this machine's token, where
// Another program on the port refuses the upgrade, answers something else, or never answers at all
export const checkIsHostListening = async (hostname: string, port: number, token: string): Promise<boolean> => {
  const webSocket = new WebSocket(`ws://${hostname}:${port}/?${TOKEN_QUERY_PARAMETER}=${token}`, {
    handshakeTimeout: HOST_PROBE_TIMEOUT_MS,
  });
  const isHostListening = await getResultAsync(() => once(webSocket, "open")).match(
    () => true,
    () => false,
  );
  webSocket.terminate();
  return isHostListening;
};
