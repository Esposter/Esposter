import type { DecodedCurve } from "#src/models/genshinAssets/DecodedCurve";
import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { fitInterfaceClips } from "#src/services/genshinAssets/fitInterfaceClips";
import { fitInterfaceRects } from "#src/services/genshinAssets/fitInterfaceRects";
import { fitLoginClouds } from "#src/services/genshinAssets/fitLoginClouds";
import { fitLoginDoor } from "#src/services/genshinAssets/fitLoginDoor";
import { fitLoginHulls } from "#src/services/genshinAssets/fitLoginHulls";
import { fitLoginMusic } from "#src/services/genshinAssets/fitLoginMusic";
import { fitLoginPaving } from "#src/services/genshinAssets/fitLoginPaving";
import { fitLoginStone } from "#src/services/genshinAssets/fitLoginStone";
import { fitLoginTowerFacades } from "#src/services/genshinAssets/fitLoginTowerFacades";
import { fitLoginTowers } from "#src/services/genshinAssets/fitLoginTowers";
import { fitLoginWalkway } from "#src/services/genshinAssets/fitLoginWalkway";
import { fitSkyGradient } from "#src/services/genshinAssets/fitSkyGradient";
import { fitTitleLogos } from "#src/services/genshinAssets/fitTitleLogos";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/readComponentPlacements";
import { writeWorldData } from "#src/services/genshinAssets/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's,
// With its interface's rects and clips and the rows its script scrolls them in: each copied spawn's count and the
// Length of its step, by its prefab, and its music, whose fit's report leads the paths written
export const fitLoginScene = async (): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login);
  // The interface's clips as `genshin:assets clips` decoded them
  const clips = parseMachineJson<{ curves: DecodedCurve[]; duration: number; name: string }[]>(
    await readFile(join(directory.root, "clips", "clips.json"), "utf8"),
  );
  // The interface's tree as `genshin:assets interface` exported it
  const interfaceTree = parseMachineJson<InterfaceNode>(
    await readFile(join(directory.root, "interface", "interface.json"), "utf8"),
  );
  const meshDirectory = join(directory.assets, "Mesh");
  const textureDirectory = join(directory.assets, "Texture2D");
  const [towers, facades, walkway, paving, door, hulls, clouds, skyGradient, stone, titleLogos, music] =
    await Promise.all([
      fitLoginTowers(placements, meshDirectory),
      fitLoginTowerFacades(placements, meshDirectory, textureDirectory),
      fitLoginWalkway(placements, meshDirectory),
      fitLoginPaving(placements, meshDirectory, textureDirectory),
      fitLoginDoor(placements, meshDirectory, textureDirectory),
      fitLoginHulls(placements, meshDirectory),
      fitLoginClouds(textureDirectory),
      fitSkyGradient(join(textureDirectory, "Enviro_Sky_Gradient.png")),
      fitLoginStone(await readComponentMaterials(DerivedAssetComponent.Login), textureDirectory),
      fitTitleLogos(directory.root),
      fitLoginMusic(),
    ]);
  const scroll = Object.fromEntries(
    (DerivedAssetComponentMap[DerivedAssetComponent.Login].spawns ?? []).flatMap(({ copies, prefab }) =>
      copies ? [[prefab.name, { count: copies.count, length: Math.hypot(...copies.step) }]] : [],
    ),
  );
  const paths = await Promise.all([
    writeWorldData("login/towers.json", { ...towers, facades }),
    writeWorldData("login/walkway.json", walkway),
    writeWorldData("login/paving.json", paving),
    writeWorldData("login/door.json", door),
    writeWorldData("login/hulls.json", hulls),
    writeWorldData("login/clouds.json", clouds),
    writeWorldData("login/sky.json", { gradient: skyGradient }),
    writeWorldData("login/stone.json", stone),
    writeWorldData("login/scroll.json", scroll),
    writeWorldData("login/interfaceClips.json", fitInterfaceClips(clips)),
    writeWorldData("login/interfaceRects.json", fitInterfaceRects(interfaceTree)),
    writeWorldData("splash/titleLogos.json", titleLogos),
    writeWorldData("login/music.json", music.music),
  ]);
  return [...music.report, ...paths].join("\n");
};
