import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "#shared/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { z } from "zod/v4";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = AttackKey | CharacterKey;

export const spritesheetKeySchema = z.enum(SpritesheetKey) satisfies z.ZodType<SpritesheetKey>;
