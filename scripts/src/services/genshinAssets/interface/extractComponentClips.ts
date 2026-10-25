import type { ExportedAnimationClip } from "#src/models/genshinAssets/interface/ExportedAnimationClip";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { collectInterfacePaths } from "#src/services/genshinAssets/interface/collectInterfacePaths";
import { collectScenePaths } from "#src/services/genshinAssets/interface/collectScenePaths";
import { createClipNameResolver } from "#src/services/genshinAssets/interface/createClipNameResolver";
import { decodeAnimationClip } from "#src/services/genshinAssets/interface/decodeAnimationClip";
import { composeSceneTree } from "#src/services/genshinAssets/scene/composeSceneTree";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { exportClipBlocks } from "#src/services/genshinAssets/shared/exportClipBlocks";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/shared/readAssetBlocks";
import { readComponentLayout } from "#src/services/genshinAssets/shared/readComponentLayout";
import { readExportedClips } from "#src/services/genshinAssets/shared/readExportedClips";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The rate a clip's curves are sampled at, the game's frame rate, which a Web Animations timeline plays as keyframes
const CLIP_SAMPLE_RATE = 60;

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
  await exportClipBlocks(clipPattern, blocks, directory);
  const interfacePath = join(root, "interface", "interface.json");
  const interfacePaths = existsSync(interfacePath)
    ? collectInterfacePaths(parseMachineJson<InterfaceNode>(await readFile(interfacePath, "utf8")))
    : [];
  const sceneLayout = existsSync(layout) ? await readComponentLayout(component) : undefined;
  const scenePaths = sceneLayout
    ? composeSceneTree(sceneLayout.objects, sceneLayout.gameObjectDrawingMap).flatMap((top) => collectScenePaths(top))
    : [];
  const resolveName = createClipNameResolver([...interfacePaths, ...scenePaths]);
  const clips: DecodedClip[] = (await readExportedClips<ExportedAnimationClip>(directory)).map((clip) =>
    Object.assign(decodeAnimationClip(clip, CLIP_SAMPLE_RATE, resolveName), { name: clip.m_Name }),
  );
  await writeFile(join(directory, "clips.json"), JSON.stringify(clips));
  return clips;
};
