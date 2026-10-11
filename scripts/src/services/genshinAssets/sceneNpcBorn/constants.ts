import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import {
  GAME_TEXT_DIRECTORY,
  SCENE_NPC_BORN_DIRECTORY,
  SCENE_NPC_BORN_FILE_NAME,
} from "#src/services/genshinText/constants";
import { GameDataset } from "genshin-world";
import { join } from "node:path";

// The open world's NPC birth records, every NPC the scene places and where, as the community's dump holds them
export const NPC_BORN_PATH: string = join(GAME_TEXT_DIRECTORY, SCENE_NPC_BORN_DIRECTORY, SCENE_NPC_BORN_FILE_NAME);
// The births' one record, which the scene group record reads its NPCs from
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const SCENE_NPC_BORN_KEY: string = `${GameDataset.SceneNpcBorn}/scene${OPEN_WORLD_SCENE_ID}`;
