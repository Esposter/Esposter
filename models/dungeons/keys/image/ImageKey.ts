import { BattleImageKey } from "@/models/dungeons/keys/image/BattleImageKey";
import { TitleImageKey } from "@/models/dungeons/keys/image/TitleImageKey";
import { WorldImageKey } from "@/models/dungeons/keys/image/WorldImageKey";
import { z } from "zod";
import { UIImageKey } from "~/models/dungeons/keys/image/UI/UIImageKey";

export const ImageKey = {
  ...BattleImageKey,
  ...TitleImageKey,
  ...WorldImageKey,
  // Common
  ...UIImageKey,
} as const;
export type ImageKey = keyof typeof ImageKey;

export const imageKeySchema = z.nativeEnum(ImageKey) satisfies z.ZodType<ImageKey>;
