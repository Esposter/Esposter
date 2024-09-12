import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { expectType } from "@/util/test/expectType";

expectType<
  {
    // TilesetKey uses the same namespace as ImageKey & SpritesheetKey
    // so we need to validate that we can't have conflicting key names
    [P in ImageKey]?: never;
  } & {
    [P in SpritesheetKey]?: never;
  } & Record<string, string>
>(TilesetKey);
