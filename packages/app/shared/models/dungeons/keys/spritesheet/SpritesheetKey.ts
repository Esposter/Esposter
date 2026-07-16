import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import { CharacterKey } from "#shared/models/dungeons/keys/spritesheet/CharacterKey";
import { mergeObjectsStrict } from "@esposter/shared";

export const SpritesheetKey = mergeObjectsStrict(AttackKey, CharacterKey);
export type SpritesheetKey = AttackKey | CharacterKey;
