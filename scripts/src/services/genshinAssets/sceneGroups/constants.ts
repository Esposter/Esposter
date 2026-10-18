import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

import {
  OPEN_WORLD_SCENE_ID,
  SCENE_POINT_CATEGORY,
  SCENE_POINT_FILE,
} from "#src/services/genshinAssets/shared/constants";
import { GameDataset } from "genshin-world";

// The open world's scene group record, which `genshin:assets scene-groups` publishes and the residents are read from
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const SCENE_GROUPS_KEY: string = `${GameDataset.SceneGroups}/scene${OPEN_WORLD_SCENE_ID}`;
// Mondstadt's restaurant's point, the exemplar of the scene's building points, with the fields its kind holds its place
// And its turn in, and the field it names the service it marks in, as the community's dump names them
export const SCENE_BUILDING_POINT: ScenePointExemplar = {
  category: SCENE_POINT_CATEGORY,
  file: SCENE_POINT_FILE,
  id: "62",
  position: "pos",
  rotation: "rot",
};
export const SCENE_BUILDING_NAME_FIELD = "buildingType";
