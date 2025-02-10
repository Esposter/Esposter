import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tilesetKey type", () => {
  test("no conflicting values between FileKey and SpritesheetKey", () => {
    expect.hasAssertions();

    expectTypeOf(TilesetKey).toMatchTypeOf<
      // TilesetKey uses the same namespace as FileKey & SpritesheetKey
      // so we need to validate that we can't have conflicting values
      Partial<Record<FileKey, never>> & Partial<Record<SpritesheetKey, never>> & Record<string, string>
    >();
  });
});
