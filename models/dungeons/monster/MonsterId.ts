import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { z } from "zod";

export const MonsterId = {
  [ImageKey.Carnodusk]: ImageKey.Carnodusk,
  [ImageKey.Iguanignite]: ImageKey.Iguanignite,
} as const;
export type MonsterId = keyof typeof MonsterId;

export const monsterIdSchema = z.nativeEnum(MonsterId) satisfies z.ZodType<MonsterId>;
