import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { extractShader } from "#src/services/genshinAssets/materials/extractShader";
import {
  ANIMESTUDIO_UNPARSED_SUFFIX,
  DEFERRED_SHADING_BLOCK,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/shared/readComponentMaterials";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { existsSync, readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import { basename, join } from "node:path";

// The shaders a component's materials draw with, as references to read: every shader in the blocks holding them,
// Since a shader is exported nameless and its block holds the post-processing and sky shaders beside it, and the
// Deferred passes' block, which lights what those shaders write into the G-buffer. Each is
// Exported raw, its compiled programs carved out, disassembled and decompiled to HLSL into a folder of its own with its
// Property names, and the one line per shader returned says what it is and how many of its programs Windows'
// Disassembler read. A raw export is written unparsed, since AnimeStudio's parser refuses some of the game's shaders,
// The login stone's among them, and drops whatever it refuses even from a raw export
export const extractComponentShaders = async (component: DerivedAssetComponent): Promise<string[]> => {
  const materials = await readComponentMaterials(component);
  const shaderPathIds = new Set(materials.map(({ shaderPathId }) => shaderPathId));
  const shaders = await readIndexedAssets(
    ({ pathId, type }) => type === "Shader" && shaderPathIds.has(pathId),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  const blocks = [...new Set([...shaders.map(({ block }) => block), DEFERRED_SHADING_BLOCK])].toSorted();
  const { shaders: directory } = getComponentDirectory(component);
  await rm(directory, { force: true, recursive: true });
  const summary: string[] = [];
  for (const block of blocks) {
    const blockName = basename(block, ".blk");
    const rawDirectory = join(directory, "raw", blockName);
    runAnimeStudio(
      [
        join(INSTALLED_BLOCKS_DIRECTORY, block),
        rawDirectory,
        "--types",
        `${AssetType.Shader}${ANIMESTUDIO_UNPARSED_SUFFIX}`,
        "--export_type",
        AnimeStudioExportType.Raw,
      ],
      GENSHIN_ANIMESTUDIO_OPTIONS,
    );
    const shaderDirectory = join(rawDirectory, AssetType.Shader);
    if (!existsSync(shaderDirectory)) {
      summary.push(`${blockName}: no shader AnimeStudio could read`);
      continue;
    }
    for (const file of readdirSync(shaderDirectory))
      // oxlint-disable-next-line no-await-in-loop -- one shader's export, up to hundreds of megabytes, is read at a time
      summary.push(await extractShader(directory, blockName, shaderDirectory, file));
  }
  return summary;
};
