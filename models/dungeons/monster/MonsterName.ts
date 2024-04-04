import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { z } from "zod";

export const MonsterName = {
  [ImageKey.Carnodusk]: ImageKey.Carnodusk,
  [ImageKey.Iguanignite]: ImageKey.Iguanignite,
} as const;
export type MonsterName = keyof typeof MonsterName;

export const monsterNameSchema = z.nativeEnum(MonsterName) satisfies z.ZodType<MonsterName>;
