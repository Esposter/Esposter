import { ServerMessageType } from "#src/models/server/ServerMessageType";
import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";
import { generateKeyPairSync } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { describe, expect, onTestFinished, test } from "vitest";
import { WebSocketServer } from "ws";

describe(sendToRunningHost, () => {
  const { privateKey: hostKey } = generateKeyPairSync("ed25519");

  test("does not take another program on the port for the host", async () => {
    expect.hasAssertions();

    const httpServer = createServer((_request, response) => {
      response.writeHead(200).end();
    });
    httpServer.listen(0, DEFAULT_HOSTNAME);
    await once(httpServer, "listening");
    const address = httpServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
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
        webSocket.send(JSON.stringify({ nonce: " ", signature: " ", type: ServerMessageType.Proof }));
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
});
