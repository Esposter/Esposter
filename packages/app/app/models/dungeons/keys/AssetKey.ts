import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const AssetKey = mergeObjectsStrict(ImageKey, SpritesheetKey);
export type AssetKey = ImageKey | SpritesheetKey;

export const assetKeySchema = z.enum(AssetKey) satisfies z.ZodType<AssetKey>;
