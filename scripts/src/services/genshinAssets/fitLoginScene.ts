import type { DecodedCurve } from "#src/models/genshinAssets/DecodedCurve";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { fitAlbedo } from "#src/services/genshinAssets/fitAlbedo";
import { fitSkyGradient } from "#src/services/genshinAssets/fitSkyGradient";
import { fitInterfaceClips } from "#src/services/genshinAssets/fitInterfaceClips";
import { fitLoginClouds } from "#src/services/genshinAssets/fitLoginClouds";
import { fitLoginDoor } from "#src/services/genshinAssets/fitLoginDoor";
import { fitLoginHulls } from "#src/services/genshinAssets/fitLoginHulls";
import { fitLoginTowers } from "#src/services/genshinAssets/fitLoginTowers";
import { fitLoginWalkway } from "#src/services/genshinAssets/fitLoginWalkway";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readComponentPlacements } from "#src/services/genshinAssets/readComponentPlacements";
import { writeWorldData } from "#src/services/genshinAssets/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Every login part's diffuse texture, which its stone's one colour is fitted from
const LOGIN_DIFFUSE_REGEX = /^LoginScene_.+_Diffuse\.png$/u;
// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's,
// With the rows its script scrolls them in: each copied spawn's count and the length of its step, by its prefab
export const fitLoginScene = async (): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login);
  // The interface's clips as `genshin:assets clips` decoded them
  const clips = parseMachineJson<{ curves: DecodedCurve[]; duration: number; name: string }[]>(
    await readFile(join(directory.root, "clips", "clips.json"), "utf8"),
  );
  const meshDirectory = join(directory.assets, "Mesh");
  const textureDirectory = join(directory.assets, "Texture2D");
  const diffusePaths = (await readdir(textureDirectory))
    .filter((name) => LOGIN_DIFFUSE_REGEX.test(name))
    .map((name) => join(textureDirectory, name));
  const [towers, walkway, door, hulls, clouds, skyGradient, stone] = await Promise.all([
    fitLoginTowers(placements, meshDirectory),
    fitLoginWalkway(placements, meshDirectory),
    fitLoginDoor(placements, meshDirectory),
    fitLoginHulls(placements, meshDirectory),
    fitLoginClouds(textureDirectory),
    fitSkyGradient(join(textureDirectory, "Enviro_Sky_Gradient.png")),
    fitAlbedo(diffusePaths),
  ]);
  const scroll = Object.fromEntries(
    (DerivedAssetComponentMap[DerivedAssetComponent.Login].spawns ?? []).flatMap(({ copies, prefab }) =>
      copies ? [[prefab.name, { count: copies.count, length: Math.hypot(...copies.step) }]] : [],
    ),
  );
  const paths = await Promise.all([
    writeWorldData("login/towers.json", towers),
    writeWorldData("login/walkway.json", walkway),
    writeWorldData("login/door.json", door),
    writeWorldData("login/hulls.json", hulls),
    writeWorldData("login/clouds.json", clouds),
    writeWorldData("login/sky.json", { gradient: skyGradient }),
    writeWorldData("login/palette.json", { stone }),
    writeWorldData("login/scroll.json", scroll),
    writeWorldData("login/interfaceClips.json", fitInterfaceClips(clips)),
  ]);
  return paths.join("\n");
};
