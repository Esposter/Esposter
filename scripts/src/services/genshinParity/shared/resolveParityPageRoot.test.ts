import type { Server } from "node:http";

import { PARITY_PAGE_TITLE, PARITY_PORT_COUNT } from "#src/services/genshinParity/shared/constants";
import { resolveParityPageRoot } from "#src/services/genshinParity/shared/resolveParityPageRoot";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createServer } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveParityPageRoot, () => {
  let servers: Server[] = [];

  afterEach(() => {
    for (const server of servers) server.close();
    servers = servers.toSpliced(0);
  });

  // Serves `body` on a free port, and returns the port
  const serve = (body: string): Promise<number> =>
    new Promise((resolve) => {
      const server = createServer((_request, response) => {
        response.end(body);
      });
      servers.push(server);
      server.listen(0, () => {
        const address = server.address();
        resolve(typeof address === "object" && address ? address.port : 0);
      });
    });

  test("finds the parity page on the port it is served from", async () => {
    expect.hasAssertions();
    const port = await serve(`<html><head>${PARITY_PAGE_TITLE}</head></html>`);

    await expect(resolveParityPageRoot(port)).resolves.toBe(`http://localhost:${port}/parity/`);
  });

  test("rejects a server on the port whose page is not the parity page", async () => {
    expect.hasAssertions();
    const port = await serve("<html><head><title>Something else</title></head></html>");

    await expect(resolveParityPageRoot(port)).rejects.toStrictEqual(
      new InvalidOperationError(
        Operation.Read,
        "parity page",
        `no server answers on ports ${port} to ${port + PARITY_PORT_COUNT - 1}; start one with pnpm -C packages/genshin-world parity`,
      ),
    );
  });
});
