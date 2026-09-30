import type { AssetPlacement } from "#src/models/genshinAssets/AssetPlacement";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { fitLoginDoor } from "#src/services/genshinAssets/fitLoginDoor";
import { fitLoginTowers } from "#src/services/genshinAssets/fitLoginTowers";
import { fitLoginWalkway } from "#src/services/genshinAssets/fitLoginWalkway";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { writeWorldData } from "#src/services/genshinAssets/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's
export const fitLoginScene = async (): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = parseMachineJson<AssetPlacement[]>(await readFile(directory.placements, "utf8"));
  const meshDirectory = join(directory.assets, "Mesh");
  const [towers, walkway, door] = await Promise.all([
    fitLoginTowers(placements, meshDirectory),
    fitLoginWalkway(placements, meshDirectory),
    fitLoginDoor(placements, meshDirectory),
  ]);
  const paths = await Promise.all([
    writeWorldData("login/towers.json", towers),
    writeWorldData("login/walkway.json", walkway),
    writeWorldData("login/door.json", door),
  ]);
  return paths.join("\n");
};
