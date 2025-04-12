import type { Type } from "arktype";

import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "@/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@esposter/shared";
import { type } from "arktype";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = AttackKey | CharacterKey;

export const spriteSheetKeySchema = type.valueOf(SpritesheetKey) satisfies Type<SpritesheetKey>;
