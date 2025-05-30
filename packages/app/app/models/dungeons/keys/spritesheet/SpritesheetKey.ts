import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "@/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod/v4";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = AttackKey | CharacterKey;

export const spriteSheetKeySchema = z.enum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
