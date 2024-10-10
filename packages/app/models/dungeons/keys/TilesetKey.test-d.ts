import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("tilesetKey type", () => {
  test("no conflicting values between ImageKey and SpritesheetKey", () => {
    expect.hasAssertions();

    expectTypeOf(TilesetKey).toMatchTypeOf<
      {
        // TilesetKey uses the same namespace as ImageKey & SpritesheetKey
        // so we need to validate that we can't have conflicting values
        [P in ImageKey]?: never;
      } & {
        [P in SpritesheetKey]?: never;
      } & Record<string, string>
    >();
  });
});
