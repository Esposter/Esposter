import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tilesetKey type", () => {
  test("no conflicting values between ImageKey and SpritesheetKey", () => {
    expect.hasAssertions();

    expectTypeOf(TilesetKey).toExtend<
      // The three key enums share one namespace, so a value in two of them resolves to whichever loads last
      Partial<Record<ImageKey, never>> & Partial<Record<SpritesheetKey, never>> & Record<string, string>
    >();
  });
});
