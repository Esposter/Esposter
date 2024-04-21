import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { z } from "zod";

export const MonsterName = MonsterKey;
export type MonsterName = keyof typeof MonsterName;

export const monsterNameSchema = z.nativeEnum(MonsterName) satisfies z.ZodType<MonsterName>;
