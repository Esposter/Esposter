import type { Nuxt } from "nuxt/schema";

import { GENSHIN_CHARACTER_PACK_BASE_URL } from "#shared/services/genshin/constants";
import serveGenshinCharacterPacks from "@@/modules/serveGenshinCharacterPacks";
import { join } from "node:path";
import { addServerHandler } from "nuxt/kit";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("nuxt/kit"), async (importOriginal) => ({
  ...(await importOriginal()),
  addServerHandler: vi.fn<typeof addServerHandler>(),
}));

// The module reads nothing of Nuxt but whether it runs under `nuxt dev` and where the server's directory is
const createNuxt = (isDevelopment: boolean) => ({ options: { dev: isDevelopment, serverDir: "" } }) as unknown as Nuxt;

describe("serveGenshinCharacterPacks", () => {
  test("registers no route for a build", async () => {
    expect.hasAssertions();

    await serveGenshinCharacterPacks({}, createNuxt(false));

    expect(addServerHandler).not.toHaveBeenCalled();
  });

  test("registers the packs' route under nuxt dev", async () => {
    expect.hasAssertions();

    await serveGenshinCharacterPacks({}, createNuxt(true));

    expect(addServerHandler).toHaveBeenCalledExactlyOnceWith({
      handler: join("development", "genshinCharacterPacks.ts"),
      method: "get",
      route: `${GENSHIN_CHARACTER_PACK_BASE_URL}/**`,
    });
  });
});
