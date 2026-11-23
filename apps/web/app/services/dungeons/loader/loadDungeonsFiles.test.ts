import { loadDungeonsFiles } from "#src/services/dungeons/loader/loadDungeonsFiles";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

describe(loadDungeonsFiles, () => {
  const origin = HostedAssetOriginMap[CloudflareEnvironment.Development];

  test("setCORS runs before the first file is queued", () => {
    expect.hasAssertions();

    const image = vi.fn<(key: string, url: string) => void>();
    const setCORS = vi.fn<(crossOrigin: string) => void>();
    const scene = Object.assign(createSceneWithPlugins(), {
      load: {
        audio: () => undefined,
        font: () => undefined,
        image,
        setCORS,
        spritesheet: () => undefined,
        tilemapTiledJSONExternal: () => undefined,
      },
    });
    loadDungeonsFiles(scene, origin);

    expect(setCORS).toHaveBeenCalledExactlyOnceWith("anonymous");
    expect(takeOne(setCORS.mock.invocationCallOrder, 0)).toBeLessThan(takeOne(image.mock.invocationCallOrder, 0));
  });
});
