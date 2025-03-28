import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "@/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = AttackKey | CharacterKey;

export const spriteSheetKeySchema = z.nativeEnum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
