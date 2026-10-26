import { PARITY_PAGE_TITLE } from "#src/services/genshinParity/shared/constants";
import { resolveParityPageRoot } from "#src/services/genshinParity/shared/resolveParityPageRoot";
import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

const servers: Server[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.close();
});

// Serves `body` on a free port, and returns the port
const serve = (body: string): Promise<number> =>
  new Promise((resolve) => {
    const server = createServer((_, response) => response.end(body));
    servers.push(server);
    server.listen(0, () => {
      const address = server.address();
      resolve(typeof address === "object" && address ? address.port : 0);
    });
  });

describe(resolveParityPageRoot, () => {
  test("finds the parity page on the port it is served from", async () => {
    expect.hasAssertions();
    const port = await serve(`<html><head>${PARITY_PAGE_TITLE}</head></html>`);

    await expect(resolveParityPageRoot(port)).resolves.toBe(`http://localhost:${port}/parity/`);
  });

  test("rejects a server on the port whose page is not the parity page", async () => {
    expect.hasAssertions();
    const port = await serve("<html><head><title>Something else</title></head></html>");

    await expect(resolveParityPageRoot(port)).rejects.toThrow("no server answers");
  });
});
