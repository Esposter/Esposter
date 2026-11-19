import { AttackAssetMap } from "#src/services/dungeons/loader/spritesheet/AttackAssetMap";
import { CharacterAssetMap } from "#src/services/dungeons/loader/spritesheet/CharacterAssetMap";
import { mergeObjectsStrict } from "@esposter/shared";

export const SpritesheetAssetMap = mergeObjectsStrict(AttackAssetMap, CharacterAssetMap);
