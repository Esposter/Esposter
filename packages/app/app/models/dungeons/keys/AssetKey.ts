import type { Type } from "arktype";

import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { type } from "arktype";

export const AssetKey = mergeObjectsStrict(ImageKey, SpritesheetKey);
export type AssetKey = ImageKey | SpritesheetKey;

export const assetKeySchema = type.valueOf(AssetKey) satisfies Type<AssetKey>;
