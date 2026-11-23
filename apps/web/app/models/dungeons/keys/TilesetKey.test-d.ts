import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "#src/models/dungeons/keys/TilesetKey";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tilesetKey type", () => {
  test("shares no value with DungeonsKey or SpritesheetKey", () => {
    expect.hasAssertions();

    expectTypeOf(TilesetKey).toExtend<
      // The three key enums share one namespace, so a value in two of them resolves to whichever loads last
      Partial<Record<DungeonsKey, never>> & Partial<Record<SpritesheetKey, never>> & Record<string, string>
    >();
  });
});
