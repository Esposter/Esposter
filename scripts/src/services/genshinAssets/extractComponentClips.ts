import type { DecodedCurve } from "#src/models/genshinAssets/DecodedCurve";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { ExportedAnimationClip } from "#src/models/genshinAssets/ExportedAnimationClip";
import type { InterfaceNode } from "#src/models/genshinAssets/InterfaceNode";

import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/constants";
import { createClipNameResolver } from "#src/services/genshinAssets/createClipNameResolver";
import { decodeAnimationClip } from "#src/services/genshinAssets/decodeAnimationClip";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/DerivedAssetComponentMap";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readAssetBlocks } from "#src/services/genshinAssets/readAssetBlocks";
import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// The rate a clip's curves are sampled at, the game's frame rate, which a Web Animations timeline plays as keyframes
export const CLIP_SAMPLE_RATE = 60;
// A component's animation clips, decoded: every clip whose name its map's pattern matches is exported as JSON from the
// Blocks holding it, its curves decoded and sampled, and each binding named where its CRC32 resolves, a property
// Against Unity's names and a path against the component's interface tree (written by `interface`, if it has run).
// The clips are written beside the exports
export const extractComponentClips = async (
  component: DerivedAssetComponent,
): Promise<{ curves: DecodedCurve[]; duration: number; name: string }[]> => {
  const { clipPattern } = DerivedAssetComponentMap[component];
  if (!clipPattern) throw new InvalidOperationError(Operation.Read, component, "names no clips");
  const { root } = getComponentDirectory(component);
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
      "AnimationClip",
      "--names",
      clipPattern,
      "--export_type",
      "JSON",
    ]);
  const interfacePath = join(root, "interface", "interface.json");
  const trees = existsSync(interfacePath)
    ? [parseMachineJson<InterfaceNode>(await readFile(interfacePath, "utf8"))]
    : [];
  const resolveName = createClipNameResolver(trees);
  const clips: { curves: DecodedCurve[]; duration: number; name: string }[] = [];
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
