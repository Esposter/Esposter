import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { checkIsHostListening } from "#src/services/server/checkIsHostListening";
import { once } from "node:events";
import { createServer } from "node:http";
import { describe, expect, onTestFinished, test } from "vitest";
import { WebSocketServer } from "ws";

describe(checkIsHostListening, () => {
  test("finds a server that accepts the connection", async () => {
    expect.hasAssertions();

    const webSocketServer = new WebSocketServer({ host: DEFAULT_HOSTNAME, port: 0 });
    await once(webSocketServer, "listening");
    const address = webSocketServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    onTestFinished(() => {
      for (const webSocket of webSocketServer.clients) webSocket.terminate();
      webSocketServer.close();
    });

    await expect(checkIsHostListening(DEFAULT_HOSTNAME, port, "")).resolves.toBe(true);
  });

  test("does not take another program on the port for a host", async () => {
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

    await expect(checkIsHostListening(DEFAULT_HOSTNAME, port, "")).resolves.toBe(false);
  });
});
