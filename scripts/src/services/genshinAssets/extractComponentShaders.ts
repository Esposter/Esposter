import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

import { annotateProgramConstants } from "#src/services/genshinAssets/annotateProgramConstants";
import {
  ANIMESTUDIO_UNPARSED_SUFFIX,
  DEFERRED_SHADING_BLOCK,
  GAME_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/constants";
import { decompileDxbcDirectory } from "#src/services/genshinAssets/decompileDxbcDirectory";
import { disassembleDxbcDirectory } from "#src/services/genshinAssets/disassembleDxbcDirectory";
import { getComponentDirectory } from "#src/services/genshinAssets/getComponentDirectory";
import { readComponentMaterials } from "#src/services/genshinAssets/readComponentMaterials";
import { readDxbcPrograms } from "#src/services/genshinAssets/readDxbcPrograms";
import { readIndexedAssets } from "#src/services/genshinAssets/readIndexedAssets";
import { readShaderConstantLayouts } from "#src/services/genshinAssets/readShaderConstantLayouts";
import { readShaderPropertyNames } from "#src/services/genshinAssets/readShaderPropertyNames";
import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { getResultAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// How many of a shader's property names its summary line prints, enough to tell it apart
const SUMMARY_PROPERTY_COUNT = 4;
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
  const shaders = await readIndexedAssets(({ pathId, type }) => type === "Shader" && shaderPathIds.has(pathId));
  const blocks = [...new Set([...shaders.map(({ block }) => block), DEFERRED_SHADING_BLOCK])].toSorted();
  const { shaders: directory } = getComponentDirectory(component);
  await rm(directory, { force: true, recursive: true });
  const summary: string[] = [];
  for (const block of blocks) {
    const blockName = basename(block, ".blk");
    const rawDirectory = join(directory, "raw", blockName);
    runAnimeStudio([
      join(GAME_BLOCKS_DIRECTORY, block),
      rawDirectory,
      "--types",
      `Shader${ANIMESTUDIO_UNPARSED_SUFFIX}`,
      "--export_type",
      "Raw",
    ]);
    const shaderDirectory = join(rawDirectory, "Shader");
    if (!existsSync(shaderDirectory)) {
      summary.push(`${blockName}: no shader AnimeStudio could read`);
      continue;
    }
    // oxlint-disable-next-line no-await-in-loop -- a block's shaders are read once AnimeStudio has exported them
    for (const file of await readdir(shaderDirectory)) {
      // oxlint-disable-next-line no-await-in-loop -- one shader's export, up to hundreds of megabytes, is read at a time
      const data = await readFile(join(shaderDirectory, file));
      const programDirectory = join(directory, blockName, basename(file, ".dat"));
      // oxlint-disable-next-line no-await-in-loop -- its programs are written into the folder it disassembles
      await mkdir(programDirectory, { recursive: true });
      const propertyNames = readShaderPropertyNames(data);
      const programs = readDxbcPrograms(data);
      // oxlint-disable-next-line no-await-in-loop -- as above
      await Promise.all([
        writeFile(join(programDirectory, "properties.txt"), propertyNames.join("\n")),
        ...programs.map((program, index) =>
          writeFile(join(programDirectory, `${String(index).padStart(5, "0")}.dxbc`), program),
        ),
      ]);
      const count = disassembleDxbcDirectory(programDirectory);
      // And decompiled to HLSL beside it where the pinned decompiler can be had, the annotated assembly the source where
      // It cannot
      // oxlint-disable-next-line no-await-in-loop -- as above
      const decompiledCount = await getResultAsync(() => decompileDxbcDirectory(programDirectory)).match(
        (decompiled) => decompiled,
        (error) => {
          console.error(`${programDirectory}: no HLSL, the assembly stands: ${String(error)}`);
          return 0;
        },
      );
      // Each program's assembly and HLSL are headed by what its constant buffer's registers hold, from its shader's layouts
      const layouts = readShaderConstantLayouts(data);
      // oxlint-disable-next-line no-await-in-loop -- as above
      const assemblyNames = (await readdir(programDirectory)).filter(
        (name) => name.endsWith(".asm") || name.endsWith(".hlsl"),
      );
      // oxlint-disable-next-line no-await-in-loop -- as above
      await Promise.all(
        assemblyNames.map(async (name) => {
          const path = join(programDirectory, name);
          await writeFile(path, annotateProgramConstants(await readFile(path, "utf8"), layouts));
        }),
      );
      // oxlint-disable-next-line no-await-in-loop -- the programs are read as assembly and HLSL from here on
      await Promise.all(
        programs.map((_, index) => rm(join(programDirectory, `${String(index).padStart(5, "0")}.dxbc`))),
      );
      summary.push(
        `${blockName}/${basename(file, ".dat")}: ${count} of ${programs.length} programs disassembled, ${decompiledCount} decompiled, ${propertyNames.slice(0, SUMMARY_PROPERTY_COUNT).join(" ")}`,
      );
    }
  }
  return summary;
};
