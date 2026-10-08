import type { ExportedMesh } from "#src/models/genshinAssets/shared/ExportedMesh";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";
import type { SoundEffect } from "genshin-engine";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitCloudLayerDome } from "#src/services/genshinAssets/fit/fitCloudLayerDome";
import { fitCloudLayerTextures } from "#src/services/genshinAssets/fit/fitCloudLayerTextures";
import { fitInterfaceClips } from "#src/services/genshinAssets/fit/fitInterfaceClips";
import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { fitLoginClouds } from "#src/services/genshinAssets/fit/fitLoginClouds";
import { fitLoginDoor } from "#src/services/genshinAssets/fit/fitLoginDoor";
import { fitLoginHulls } from "#src/services/genshinAssets/fit/fitLoginHulls";
import { fitLoginMusic } from "#src/services/genshinAssets/fit/fitLoginMusic";
import { fitLoginPaving } from "#src/services/genshinAssets/fit/fitLoginPaving";
import { fitLoginStone } from "#src/services/genshinAssets/fit/fitLoginStone";
import { fitLoginTowerFacades } from "#src/services/genshinAssets/fit/fitLoginTowerFacades";
import { fitLoginTowers } from "#src/services/genshinAssets/fit/fitLoginTowers";
import { fitLoginWalkway } from "#src/services/genshinAssets/fit/fitLoginWalkway";
import { fitSkyGradient } from "#src/services/genshinAssets/fit/fitSkyGradient";
import { fitSoundEffect } from "#src/services/genshinAssets/fit/fitSoundEffect";
import { fitTitleLogos } from "#src/services/genshinAssets/fit/fitTitleLogos";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentClips } from "#src/services/genshinAssets/shared/readComponentClips";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { DerivedAssetSoundEffectMap } from "#src/services/genshinAssets/sound/DerivedAssetSoundEffectMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The sky's cloud layer's material, and the settings of our cloud layer its floats set, by the property each is read
// From
const CLOUD_LAYER_MATERIAL = "Enviro_Cloud_Layer_Mat";
const CLOUD_LAYER_MATERIAL_SETTING_MAP = {
  curlAmplitude: "_CloudCurlAmplitude",
  curlSpeed: "_CloudCurlSpeed",
  curlTiling: "_CloudCurlTiling",
  wispsOpacity: "_CloudWispsOpacity",
} as const;
// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's,
// With its interface's rects and clips and the rows its script scrolls them in: each copied spawn's count and the
// Length of its step, by its prefab, its music, whose fit's report stands before its path, and its sounds
export const fitLoginScene = async (only: readonly string[] = []): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login);
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  const textureDirectory = join(directory.assets, AssetType.Texture2D);
  const fits: Record<string, () => Promise<string[]>> = {
    // The cloud layer's textures as the statistics ours are synthesized from
    cloudLayerTextures: async () => [
      await writeWorldData("login/cloudLayerTextures.json", await fitCloudLayerTextures(textureDirectory)),
    ],
    clouds: async () => [await writeWorldData("login/clouds.json", await fitLoginClouds(textureDirectory))],
    door: async () => [
      await writeWorldData(
        "login/door.json",
        await fitLoginDoor(
          placements,
          await readComponentClips(DerivedAssetComponent.Login),
          meshDirectory,
          textureDirectory,
        ),
      ),
    ],
    hulls: async () => [await writeWorldData("login/hulls.json", await fitLoginHulls(placements, meshDirectory))],
    interfaceClips: async () => [
      await writeWorldData(
        "login/interfaceClips.json",
        fitInterfaceClips(await readComponentClips(DerivedAssetComponent.Login)),
      ),
    ],
    // The interface's tree as `genshin:assets interface` exported it
    interfaceRects: async () => {
      const interfaceTree = parseMachineJson<InterfaceNode>(
        await readFile(join(directory.root, "interface", "interface.json"), "utf8"),
      );
      return [await writeWorldData("login/interfaceRects.json", fitInterfaceRects(interfaceTree))];
    },
    music: async () => {
      const { music, report } = await fitLoginMusic();
      return [...report, await writeWorldData("login/music.json", music)];
    },
    paving: async () => [
      await writeWorldData("login/paving.json", await fitLoginPaving(placements, meshDirectory, textureDirectory)),
    ],
    scroll: async () => {
      const scroll = Object.fromEntries(
        (DerivedAssetComponentMap[DerivedAssetComponent.Login].spawns ?? []).flatMap(({ copies, prefab }) =>
          copies ? [[prefab.name, { count: copies.count, length: Math.hypot(...copies.step) }]] : [],
        ),
      );
      return [await writeWorldData("login/scroll.json", scroll)];
    },
    // The sky's gradient, and the dome its cloud layer is drawn on with its material's curl and wisps
    sky: async () => {
      const [gradient, cloudDome, materials] = await Promise.all([
        fitSkyGradient(join(textureDirectory, "Enviro_Sky_Gradient.png")),
        readFile(join(meshDirectory, "Cloud_LOD0.json"), "utf8"),
        readComponentMaterials(DerivedAssetComponent.Login),
      ]);
      const { dome, residual } = fitCloudLayerDome(parseMachineJson<ExportedMesh>(cloudDome));
      const floats = materials.find(({ name }) => name === CLOUD_LAYER_MATERIAL)?.floats ?? {};
      const cloudLayerMaterial = Object.fromEntries(
        Object.entries(CLOUD_LAYER_MATERIAL_SETTING_MAP).map(([setting, property]) => [setting, floats[property] ?? 0]),
      );
      return [
        `the cloud layer's dome drawn from its profiles stands ${residual.toFixed(4)} off its own projections`,
        await writeWorldData("login/sky.json", { cloudLayer: dome, cloudLayerMaterial, gradient }),
      ];
    },
    // The sounds the login plays beside its music, each from the game's sounds matched for it
    sounds: async () => {
      const effects: Record<string, SoundEffect> = {};
      for (const [name, { pattern, sounds }] of Object.entries(DerivedAssetSoundEffectMap[DerivedAssetComponent.Login]))
        // oxlint-disable-next-line no-await-in-loop -- each effect's sounds are decoded into one folder in turn
        effects[name] = await fitSoundEffect(pattern, sounds);
      return [await writeWorldData("login/sounds.json", effects)];
    },
    stone: async () => {
      const materials = await readComponentMaterials(DerivedAssetComponent.Login);
      return [await writeWorldData("login/stone.json", await fitLoginStone(materials, textureDirectory))];
    },
    titleLogos: async () => [await writeWorldData("splash/titleLogos.json", await fitTitleLogos(directory.root))],
    towers: async () => {
      const [towers, facades] = await Promise.all([
        fitLoginTowers(placements, meshDirectory),
        fitLoginTowerFacades(placements, meshDirectory, textureDirectory),
      ]);
      return [await writeWorldData("login/towers.json", { ...towers, facades })];
    },
    walkway: async () => [await writeWorldData("login/walkway.json", await fitLoginWalkway(placements, meshDirectory))],
  };
  return runFits(fits, only);
};
