import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod/v4";

export const AssetKey = mergeObjectsStrict(ImageKey, SpritesheetKey);
export type AssetKey = ImageKey | SpritesheetKey;

export const assetKeySchema = z.enum(AssetKey) satisfies z.ZodType<AssetKey>;
