import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { dungeonsLock } from "#src/services/dungeons/loader/dungeonsLock";
import { loadImages } from "#src/services/dungeons/loader/loadImages";
import { createSceneWithPlugins } from "#src/services/phaser/createSceneWithPlugins.test";
import { CloudflareEnvironment, HostedAssetOriginMap } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { getHostedAssetUrl } from "hosted-assets";
import { describe, expect, test, vi } from "vitest";

describe(loadImages, () => {
  const origin = HostedAssetOriginMap[CloudflareEnvironment.Development];

  test("a texture the scene draws comes from its hosted url", () => {
    expect.hasAssertions();

    const image = vi.fn<(key: string, url: string) => void>();
    const scene = Object.assign(createSceneWithPlugins(), { load: { image } });
    loadImages(scene, origin, [DungeonsKeys.SceneBattleForestBackground]);

    expect(image).toHaveBeenCalledExactlyOnceWith(
      DungeonsKeys.SceneBattleForestBackground,
      getHostedAssetUrl(origin, takeOne(dungeonsLock.objects, DungeonsKeys.SceneBattleForestBackground)),
    );
  });
});
