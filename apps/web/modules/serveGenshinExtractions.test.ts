import type { Nuxt } from "nuxt/schema";

import { join } from "node:path";
import { addServerHandler } from "nuxt/kit";
import { describe, expect, test, vi } from "vitest";

import {
  GENSHIN_CHARACTER_PACK_BASE_URL,
  GENSHIN_SCENE_EXPORT_BASE_URL,
} from "../shared/services/genshin/constants.ts";
import serveGenshinExtractions from "./serveGenshinExtractions.ts";

vi.mock(import("nuxt/kit"), async (importOriginal) => ({
  ...(await importOriginal()),
  addServerHandler: vi.fn<typeof addServerHandler>(),
}));

// The module reads nothing of Nuxt but whether it runs under `nuxt dev` and where the server's directory is
const createNuxt = (isDevelopment: boolean) => ({ options: { dev: isDevelopment, serverDir: "" } }) as unknown as Nuxt;

describe("serveGenshinExtractions", () => {
  test("a visitor cannot retrieve a game asset from the app", async () => {
    expect.hasAssertions();

    await serveGenshinExtractions({}, createNuxt(false));

    expect(addServerHandler).not.toHaveBeenCalled();
  });

  test("registers the packs' and the scene exports' routes under nuxt dev", async () => {
    expect.hasAssertions();

    await serveGenshinExtractions({}, createNuxt(true));

    expect(vi.mocked(addServerHandler).mock.calls).toStrictEqual([
      [
        {
          handler: join("development", "genshinCharacterPacks.ts"),
          method: "get",
          route: `${GENSHIN_CHARACTER_PACK_BASE_URL}/**`,
        },
      ],
      [
        {
          handler: join("development", "genshinSceneExports.ts"),
          method: "get",
          route: `${GENSHIN_SCENE_EXPORT_BASE_URL}/**`,
        },
      ],
    ]);
  });
});
