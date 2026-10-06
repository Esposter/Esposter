import type { ExportedAnimationClip } from "#src/models/genshinAssets/interface/ExportedAnimationClip";
import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { createClipNameResolver } from "#src/services/genshinAssets/interface/createClipNameResolver";
import { decodeAnimationClip } from "#src/services/genshinAssets/interface/decodeAnimationClip";
import { composeSceneTree } from "#src/services/genshinAssets/scene/composeSceneTree";
import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// The rate a clip's curves are sampled at, the game's frame rate, which a Web Animations timeline plays as keyframes
const CLIP_SAMPLE_RATE = 60;
// Every path in a tree, each node's named from the root down
const collectInterfacePaths = (node: InterfaceNode): string[] => [
  node.path,
  ...node.children.flatMap((child) => collectInterfacePaths(child)),
];
const collectScenePaths = ({ children, object }: SceneTreeNode, father = ""): string[] => {
  const path = father ? `${father}/${object.name}` : object.name;
  return [path, ...children.flatMap((child) => collectScenePaths(child, path))];
};
// A component's animation clips, decoded: every clip whose name its map's pattern matches is exported as JSON from the
// Blocks holding it, its curves decoded and sampled, and each binding named where its CRC32 resolves, a property
// Against Unity's names and a path against the component's interface tree (written by `interface`, if it has run) and
// Its scene tree (dumped by `extract`, if it has run). The clips are written beside the exports
export const extractComponentClips = async (component: DerivedAssetComponent): Promise<DecodedClip[]> => {
  const { clipPattern } = DerivedAssetComponentMap[component];
  if (!clipPattern) throw new InvalidOperationError(Operation.Read, component, "names no clips");
  const { layout, root } = getComponentDirectory(component);
  const directory = join(root, "clips");
  await rm(directory, { force: true, recursive: true });
  const blocks = await readAssetBlocks(clipPattern);
  if (blocks.length === 0) throw new InvalidOperationError(Operation.Read, clipPattern, "in no indexed block");
  // Made here, since AnimeStudio makes it only for a block holding a clip it exports
  await mkdir(directory, { recursive: true });
  for (const block of blocks)
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      join(directory, basename(block, ".blk")),
      "--types",
      AssetType.AnimationClip,
      "--names",
      clipPattern,
      "--export_type",
      AnimeStudioExportType.Json,
    ]);
  const interfacePath = join(root, "interface", "interface.json");
  const interfacePaths = existsSync(interfacePath)
    ? collectInterfacePaths(parseMachineJson<InterfaceNode>(await readFile(interfacePath, "utf8")))
    : [];
  const sceneLayout = existsSync(layout) ? await readComponentLayout(component) : undefined;
  const scenePaths = sceneLayout
    ? composeSceneTree(sceneLayout.objects, sceneLayout.gameObjectDrawingMap).flatMap((top) => collectScenePaths(top))
    : [];
  const resolveName = createClipNameResolver([...interfacePaths, ...scenePaths]);
  const clips: DecodedClip[] = [];
  for (const block of await readdir(directory)) {
    const clipDirectory = join(directory, block, "AnimationClip");
    if (!existsSync(clipDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one block's clips are read at a time
    for (const file of await readdir(clipDirectory)) {
      // oxlint-disable-next-line no-await-in-loop -- as above
      const clip = parseMachineJson<ExportedAnimationClip>(await readFile(join(clipDirectory, file), "utf8"));
      clips.push({ name: clip.m_Name, ...decodeAnimationClip(clip, CLIP_SAMPLE_RATE, resolveName) });
    }
  }
  await writeFile(join(directory, "clips.json"), JSON.stringify(clips));
  return clips;
};
