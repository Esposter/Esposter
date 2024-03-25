import { BattleImageKey } from "@/models/dungeons/keys/image/BattleImageKey";
import { TitleImageKey } from "@/models/dungeons/keys/image/TitleImageKey";
import { UIImageKey } from "@/models/dungeons/keys/image/UI/UIImageKey";
import { WorldImageKey } from "@/models/dungeons/keys/image/WorldImageKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const ImageKey = mergeObjectsStrict(BattleImageKey, TitleImageKey, WorldImageKey, UIImageKey);
export type ImageKey = keyof typeof ImageKey;

export const imageKeySchema = z.nativeEnum(ImageKey) satisfies z.ZodType<ImageKey>;
