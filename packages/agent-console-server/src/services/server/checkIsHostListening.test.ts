import type { IncomingMessage, RequestListener } from "node:http";

import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { answerHttpRequest } from "#src/services/server/answerHttpRequest";
import { checkIsHostListening } from "#src/services/server/checkIsHostListening";
import { HOST_CHALLENGE_HEADER } from "#src/services/server/constants";
import { once } from "node:events";
import { createServer } from "node:http";
import { describe, expect, onTestFinished, test } from "vitest";

const token = "token";

const listen = async (requestListener: RequestListener) => {
  const httpServer = createServer(requestListener);
  httpServer.listen(0, DEFAULT_HOSTNAME);
  await once(httpServer, "listening");
  onTestFinished(() => {
    httpServer.close();
  });
  const address = httpServer.address();
  return typeof address === "object" && address ? address.port : 0;
};

describe(checkIsHostListening, () => {
  test("finds the host", async () => {
    expect.hasAssertions();

    const port = await listen((request, response) => {
      answerHttpRequest(request, response, token);
    });

    await expect(checkIsHostListening(DEFAULT_HOSTNAME, port, token)).resolves.toBe(true);
  });

  test("does not take a program that answers everything for the host, nor hand it the token", async () => {
    expect.hasAssertions();

    const requests: IncomingMessage[] = [];
    // A squatter on the port, answering every request and keeping what it was sent
    const port = await listen((request, response) => {
      requests.push(request);
      response.writeHead(200).end(token);
    });

    await expect(checkIsHostListening(DEFAULT_HOSTNAME, port, token)).resolves.toBe(false);
    expect(JSON.stringify(requests.map(({ headers, url }) => ({ headers, url })))).not.toContain(token);
  });

  test("does not take a program relaying the challenge to a host on another port for the host", async () => {
    expect.hasAssertions();

    const hostPort = await listen((request, response) => {
      answerHttpRequest(request, response, token);
    });
    const port = await listen(async ({ headers }, response) => {
      const hostResponse = await fetch(`http://${DEFAULT_HOSTNAME}:${hostPort}/`, {
        headers: { [HOST_CHALLENGE_HEADER]: String(headers[HOST_CHALLENGE_HEADER]) },
      });
      response.writeHead(200).end(await hostResponse.text());
    });

    await expect(checkIsHostListening(DEFAULT_HOSTNAME, port, token)).resolves.toBe(false);
  });
});
