import { join } from "node:path";
import { addServerHandler } from "nuxt/kit";
import { describe, expect, test, vi } from "vitest";

import { DEV_SESSION_ROUTE } from "../server/services/devSession/constants.ts";
import devSession from "./devSession.ts";

vi.mock(import("nuxt/kit"), async (importOriginal) => ({
  ...(await importOriginal()),
  addServerHandler: vi.fn<typeof addServerHandler>(),
}));

describe("devSession", () => {
  // The module reads of Nuxt whether it runs under `nuxt dev` and where the server directory is
  const serverDir = "a";
  const createNuxt = (isDevelopment: boolean) =>
    ({ options: { dev: isDevelopment, serverDir } }) as unknown as Parameters<typeof devSession>[1];

  test("a production build carries no session route", async () => {
    expect.hasAssertions();

    await devSession({}, createNuxt(false));

    expect(addServerHandler).not.toHaveBeenCalled();
  });

  test("registers the session route under nuxt dev", async () => {
    expect.hasAssertions();

    await devSession({}, createNuxt(true));

    expect(addServerHandler).toHaveBeenCalledExactlyOnceWith({
      handler: join(serverDir, "services", "devSession", "postDevSession.ts"),
      method: "post",
      route: DEV_SESSION_ROUTE,
    });
  });
});
