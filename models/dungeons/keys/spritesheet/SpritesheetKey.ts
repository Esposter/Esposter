import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "@/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@/util/mergeObjectsStrict";
import { z } from "zod";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = keyof typeof SpritesheetKey;

export const spriteSheetKeySchema = z.nativeEnum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
