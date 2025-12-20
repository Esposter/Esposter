import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "#shared/models/dungeons/keys/TilesetKey";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tilesetKey type", () => {
  test("no conflicting values between ImageKey and SpritesheetKey", () => {
    expect.hasAssertions();

    expectTypeOf(TilesetKey).toExtend<
      // TilesetKey uses the same namespace as ImageKey & SpritesheetKey
      // So we need to validate that we can't have conflicting values
      Partial<Record<ImageKey, never>> & Partial<Record<SpritesheetKey, never>> & Record<string, string>
    >();
  });
});
