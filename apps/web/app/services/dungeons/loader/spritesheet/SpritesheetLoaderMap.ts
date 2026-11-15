import { AttackLoaderMap } from "#src/services/dungeons/loader/spritesheet/AttackLoaderMap";
import { CharacterLoaderMap } from "#src/services/dungeons/loader/spritesheet/CharacterLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SpritesheetLoaderMap = mergeObjectsStrict(AttackLoaderMap, CharacterLoaderMap);
export const SpritesheetLoaders = Object.values(SpritesheetLoaderMap);
