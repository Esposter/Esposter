import { handshakeMessageSchema } from "#src/models/handshake/HandshakeMessage";
import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { SignaturePurpose } from "#src/models/handshake/SignaturePurpose";
import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { signNonce } from "#src/services/handshake/signNonce";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";
import { listenOnFreePort } from "#src/services/shared/listenOnFreePort";
import { readMessageText } from "#src/services/shared/readMessageText";
import { jsonDateParse, noop } from "@esposter/shared";
import { generateKeyPairSync } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { describe, expect, onTestFinished, test, vi } from "vitest";
import { WebSocketServer } from "ws";

describe(sendToRunningHost, () => {
  const { privateKey: hostKey } = generateKeyPairSync("ed25519");

  test("does not take another program on the port for the host", async () => {
    expect.hasAssertions();

    const httpServer = createServer((_request, response) => {
      response.writeHead(200).end();
    });
    const port = await listenOnFreePort(httpServer);
    onTestFinished(() => {
      httpServer.close();
    });

    await expect(sendToRunningHost(DEFAULT_HOSTNAME, port, hostKey)).resolves.toBe(false);
  });

  // A program that answers the socket and every message, but has no host key to sign the challenge with
  test("does not take a program that answers the challenge without the host's key for the host", async () => {
    expect.hasAssertions();

    const webSocketServer = new WebSocketServer({ host: DEFAULT_HOSTNAME, port: 0 });
    await once(webSocketServer, "listening");
    webSocketServer.on("connection", (webSocket) => {
      webSocket.on("message", () => {
        webSocket.send(
          JSON.stringify({ nonce: " ", pairingProofs: [], port, signature: " ", type: ServerMessageType.Proof }),
        );
      });
    });
    const address = webSocketServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    onTestFinished(() => {
      for (const webSocket of webSocketServer.clients) webSocket.terminate();
      webSocketServer.close();
    });

    await expect(sendToRunningHost(DEFAULT_HOSTNAME, port, hostKey)).resolves.toBe(false);
  });

  // A host that proves itself, then takes the hand-off by writing a frame no WebSocket may carry, so its socket errors
  // Before it closes. The error is the socket's own, logged as it is, and it does not turn the proven host into a refusal
  test("takes a host whose socket errors on the hand-off, and logs the socket's error", async () => {
    expect.hasAssertions();

    const webSocketServer = new WebSocketServer({ host: DEFAULT_HOSTNAME, port: 0 });
    await once(webSocketServer, "listening");
    const address = webSocketServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    webSocketServer.on("connection", (webSocket, request) => {
      webSocket.on("message", (data) => {
        const message = handshakeMessageSchema.parse(jsonDateParse(readMessageText(data)));
        if (message.type === HandshakeMessageType.Challenge) {
          webSocket.send(
            JSON.stringify({
              nonce: " ",
              pairingProofs: [],
              port,
              signature: signNonce(hostKey, SignaturePurpose.HostProof, port, message.nonce),
              type: ServerMessageType.Proof,
            }),
          );
          return;
        }

        // The RSV2 bit is set on a frame with no extension to set it, which the client's reader refuses
        request.socket.write(Buffer.from([0xa1, 0x00]));
      });
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    onTestFinished(() => {
      consoleError.mockRestore();
      for (const webSocket of webSocketServer.clients) webSocket.terminate();
      webSocketServer.close();
    });

    await expect(
      sendToRunningHost(DEFAULT_HOSTNAME, port, hostKey, (signature) => ({
        code: crypto.randomUUID(),
        signature,
        type: HandshakeMessageType.HandOff,
      })),
    ).resolves.toBe(true);
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ code: "WS_ERR_UNEXPECTED_RSV_2_3" }),
    );
  });
});
