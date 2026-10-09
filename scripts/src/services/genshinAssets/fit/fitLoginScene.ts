import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
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
// The login scene's parts fitted as our own kits' parameters, each a record under `login/`, with its interface's rects
// And clips and the rows its script scrolls them in: each copied spawn's count and the length of its step, by its
// Prefab, its music, whose fit's report is its note, and its sounds. Its title logos are a record each, by their logo
export const fitLoginScene = async (only: readonly string[] = []): Promise<GameDataBuild> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login);
  const meshDirectory = join(directory.assets, AssetType.Mesh);
  const textureDirectory = join(directory.assets, AssetType.Texture2D);
  const fits: Record<string, () => Promise<GameDataBuild>> = {
    // The cloud layer's textures as the statistics ours are synthesized from
    cloudLayerTextures: async () => ({
      notes: [],
      objects: { "login/cloudLayerTextures": await fitCloudLayerTextures(textureDirectory) },
    }),
    clouds: async () => ({ notes: [], objects: { "login/clouds": await fitLoginClouds(textureDirectory) } }),
    door: async () => ({
      notes: [],
      objects: {
        "login/door": await fitLoginDoor(
          placements,
          await readComponentClips(DerivedAssetComponent.Login),
          meshDirectory,
          textureDirectory,
        ),
      },
    }),
    hulls: async () => ({ notes: [], objects: { "login/hulls": await fitLoginHulls(placements, meshDirectory) } }),
    interfaceClips: async () => ({
      notes: [],
      objects: { "login/interfaceClips": fitInterfaceClips(await readComponentClips(DerivedAssetComponent.Login)) },
    }),
    // The interface's tree as `genshin:assets interface` exported it
    interfaceRects: async () => {
      const interfaceTree = parseMachineJson<InterfaceNode>(
        await readFile(join(directory.root, "interface", "interface.json"), "utf8"),
      );
      return { notes: [], objects: { "login/interfaceRects": fitInterfaceRects(interfaceTree) } };
    },
    music: async () => {
      const { music, report } = await fitLoginMusic();
      return { notes: report, objects: { "login/music": music } };
    },
    paving: async () => ({
      notes: [],
      objects: { "login/paving": await fitLoginPaving(placements, meshDirectory, textureDirectory) },
    }),
    scroll: () =>
      Promise.resolve({
        notes: [],
        objects: {
          "login/scroll": Object.fromEntries(
            (DerivedAssetComponentMap[DerivedAssetComponent.Login].spawns ?? []).flatMap(({ copies, prefab }) =>
              copies ? [[prefab.name, { count: copies.count, length: Math.hypot(...copies.step) }]] : [],
            ),
          ),
        },
      }),
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
      return {
        notes: [`the cloud layer's dome drawn from its profiles stands ${residual.toFixed(4)} off its own projections`],
        objects: { "login/sky": { cloudLayer: dome, cloudLayerMaterial, gradient } },
      };
    },
    // The sounds the login plays beside its music, each from the game's sounds matched for it
    sounds: async () => {
      const effects: Record<string, SoundEffect> = {};
      for (const [name, { pattern, sounds }] of Object.entries(DerivedAssetSoundEffectMap[DerivedAssetComponent.Login]))
        // oxlint-disable-next-line no-await-in-loop -- each effect's sounds are decoded into one folder in turn
        effects[name] = await fitSoundEffect(pattern, sounds);
      return { notes: [], objects: { "login/sounds": effects } };
    },
    stone: async () => {
      const materials = await readComponentMaterials(DerivedAssetComponent.Login);
      return { notes: [], objects: { "login/stone": await fitLoginStone(materials, textureDirectory) } };
    },
    titleLogos: async () => ({
      notes: [],
      objects: Object.fromEntries(
        Object.entries(await fitTitleLogos(directory.root)).map(([logo, path]) => [`splash/titleLogo/${logo}`, path]),
      ),
    }),
    towers: async () => {
      const [towers, facades] = await Promise.all([
        fitLoginTowers(placements, meshDirectory),
        fitLoginTowerFacades(placements, meshDirectory, textureDirectory),
      ]);
      return { notes: [], objects: { "login/towers": { ...towers, facades } } };
    },
    walkway: async () => ({
      notes: [],
      objects: { "login/walkway": await fitLoginWalkway(placements, meshDirectory) },
    }),
  };
  return runFits(fits, only);
};
