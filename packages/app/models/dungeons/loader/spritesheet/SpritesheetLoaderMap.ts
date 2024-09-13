import { AttackLoaderMap } from "@/models/dungeons/loader/spritesheet/AttackLoaderMap";
import { CharacterLoaderMap } from "@/models/dungeons/loader/spritesheet/CharacterLoaderMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SpritesheetLoaderMap = mergeObjectsStrict(AttackLoaderMap, CharacterLoaderMap);
