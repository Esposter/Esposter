import type { HandOffMessage } from "#src/models/handshake/HandOffMessage";
import type { RevokeMessage } from "#src/models/handshake/RevokeMessage";
import type { KeyObject } from "node:crypto";

import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import { serverMessageSchema } from "#src/models/server/ServerMessage";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { SECRET_BYTE_LENGTH } from "#src/services/device/constants";
import { checkIsSignatureValid } from "#src/services/handshake/checkIsSignatureValid";
import { signNonce } from "#src/services/handshake/signNonce";
import { HOST_PROBE_TIMEOUT_MS } from "#src/services/server/constants";
import { readMessageText } from "#src/services/shared/readMessageText";
import { getResultAsync } from "@esposter/shared";
import { createPublicKey, randomBytes } from "node:crypto";
import { once } from "node:events";
import { WebSocket } from "ws";

// The host's own executable, run again, talking to the host that holds the port: it sends a message only once the
// Holder has signed a fresh challenge with this user's host key, and signs the holder's nonce back with the same key.
// With no message it only finds out. Resolves whether the holder was the host — another program on the port proves
// Nothing and is told nothing
export const sendToRunningHost = async (
  hostname: string,
  port: number,
  hostKey: KeyObject,
  createMessage?: (signature: string) => HandOffMessage | RevokeMessage,
): Promise<boolean> => {
  const nonce = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
  const webSocket = new WebSocket(`ws://${hostname}:${port}`, { handshakeTimeout: HOST_PROBE_TIMEOUT_MS });
  const isHost = await getResultAsync(async () => {
    const signal = AbortSignal.timeout(HOST_PROBE_TIMEOUT_MS);
    await once(webSocket, "open", { signal });
    const pendingMessage = once(webSocket, "message", { signal });
    webSocket.send(JSON.stringify({ nonce, type: HandshakeMessageType.Challenge }));
    const [data] = await pendingMessage;
    // oxlint-disable-next-line no-restricted-properties -- the server message schema validates the payload, the pair /docs/architecture/serialization.md names
    const serverMessage = serverMessageSchema.parse(JSON.parse(readMessageText(data)));
    if (
      serverMessage.type !== ServerMessageType.Proof ||
      !checkIsSignatureValid(createPublicKey(hostKey), SignaturePurpose.HostProof, nonce, serverMessage.signature)
    )
      return false;
    if (!createMessage) return true;

    const pendingClose = once(webSocket, "close", { signal });
    webSocket.send(JSON.stringify(createMessage(signNonce(hostKey, SignaturePurpose.OwnerProof, serverMessage.nonce))));
    await pendingClose;
    return true;
  }).match(
    (isHolderHost) => isHolderHost,
    () => false,
  );
  webSocket.terminate();
  return isHost;
};
