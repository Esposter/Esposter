import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
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
import { fitTitleLogos } from "#src/services/genshinAssets/fit/fitTitleLogos";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readComponentPlacements } from "#src/services/genshinAssets/shared/readComponentPlacements";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The login scene's parts fitted as our own kits' parameters, each written as a data file of the world package's,
// With its interface's rects and clips and the rows its script scrolls them in: each copied spawn's count and the
// Length of its step, by its prefab, and its music, whose fit's report stands before its path. Named, only those
// Fits run and only their files are written, so one fit's change is read without every other file rewritten
export const fitLoginScene = async (only: readonly string[] = []): Promise<string> => {
  const directory = getComponentDirectory(DerivedAssetComponent.Login);
  const placements = await readComponentPlacements(DerivedAssetComponent.Login);
  const meshDirectory = join(directory.assets, "Mesh");
  const textureDirectory = join(directory.assets, "Texture2D");
  const fits: Record<string, () => Promise<string[]>> = {
    clouds: async () => [await writeWorldData("login/clouds.json", await fitLoginClouds(textureDirectory))],
    door: async () => [
      await writeWorldData("login/door.json", await fitLoginDoor(placements, meshDirectory, textureDirectory)),
    ],
    hulls: async () => [await writeWorldData("login/hulls.json", await fitLoginHulls(placements, meshDirectory))],
    // The interface's clips as `genshin:assets clips` decoded them
    interfaceClips: async () => {
      const clips = parseMachineJson<{ curves: DecodedCurve[]; duration: number; name: string }[]>(
        await readFile(join(directory.root, "clips", "clips.json"), "utf8"),
      );
      return [await writeWorldData("login/interfaceClips.json", fitInterfaceClips(clips))];
    },
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
    sky: async () => {
      const gradient = await fitSkyGradient(join(textureDirectory, "Enviro_Sky_Gradient.png"));
      return [await writeWorldData("login/sky.json", { gradient })];
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
  const unknown = only.find((name) => !(name in fits));
  if (unknown !== undefined)
    throw new InvalidOperationError(Operation.Read, unknown, `not a fit: one of ${Object.keys(fits).join(", ")}`);
  const lines = await Promise.all(
    Object.entries(fits)
      .filter(([name]) => only.length === 0 || only.includes(name))
      .map(([, fit]) => fit()),
  );
  return lines.flat().join("\n");
};
