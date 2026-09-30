import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { fitAlbedo } from "#src/services/genshinAssets/fitAlbedo";
import { fitHorizonBand } from "#src/services/genshinAssets/fitHorizonBand";
import { fitLoginClouds } from "#src/services/genshinAssets/fitLoginClouds";
import { fitLoginDoor } from "#src/services/genshinAssets/fitLoginDoor";
import { fitLoginSilhouettes } from "#src/services/genshinAssets/fitLoginSilhouettes";
import { fitLoginTowers } from "#src/services/genshinAssets/fitLoginTowers";
import { fitLoginWalkway } from "#src/services/genshinAssets/fitLoginWalkway";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readComponentPlacements } from "#src/services/genshinAssets/readComponentPlacements";
import { writeWorldData } from "#src/services/genshinAssets/writeWorldData";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The arrangements the login screen shows, of the several its blocks lay its meshes out in: the character select's
// Stage, which holds its towers, bridges, pillars and door at 0.4 scale (the door capture's door is that size), and the
// Walkway, a root of its own. The root `LoginScene_Build_All`, its `CG_opening01` groups and the full-scale door are
// The opening cinematic's
const LOGIN_ROOTS = ["CharacterSelectSceneNew", "LoginScene_Bridge01_Vo"];
// Every login part's diffuse texture, which its stone's one colour is fitted from
const LOGIN_DIFFUSE_REGEX = /^LoginScene_.+_Diffuse\.png$/u;
// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's
export const fitLoginScene = async (): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login, LOGIN_ROOTS);
  const meshDirectory = join(directory.assets, "Mesh");
  const textureDirectory = join(directory.assets, "Texture2D");
  const diffusePaths = (await readdir(textureDirectory))
    .filter((name) => LOGIN_DIFFUSE_REGEX.test(name))
    .map((name) => join(textureDirectory, name));
  const [towers, walkway, door, silhouettes, clouds, horizonBand, stone] = await Promise.all([
    fitLoginTowers(placements, meshDirectory),
    fitLoginWalkway(placements, meshDirectory),
    fitLoginDoor(placements, meshDirectory),
    fitLoginSilhouettes(placements, meshDirectory),
    fitLoginClouds(textureDirectory),
    fitHorizonBand(join(textureDirectory, "Enviro_Sky_Gradient.png")),
    fitAlbedo(diffusePaths),
  ]);
  const paths = await Promise.all([
    writeWorldData("login/towers.json", towers),
    writeWorldData("login/walkway.json", walkway),
    writeWorldData("login/door.json", door),
    writeWorldData("login/silhouettes.json", silhouettes),
    writeWorldData("login/clouds.json", clouds),
    writeWorldData("login/sky.json", { horizonBand }),
    writeWorldData("login/palette.json", { stone }),
  ]);
  return paths.join("\n");
};
