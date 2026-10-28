import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { annotateProgramConstants } from "#src/services/genshinAssets/materials/annotateProgramConstants";
import { decompileDxbcDirectory } from "#src/services/genshinAssets/materials/decompileDxbcDirectory";
import { disassembleDxbcDirectory } from "#src/services/genshinAssets/materials/disassembleDxbcDirectory";
import { parseShaderConstantLayouts } from "#src/services/genshinAssets/materials/parseShaderConstantLayouts";
import { parseShaderProperties } from "#src/services/genshinAssets/materials/parseShaderProperties";
import { programName } from "#src/services/genshinAssets/materials/programName";
import { readShaderPrograms } from "#src/services/genshinAssets/materials/readShaderPrograms";
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
import { getResultAsync } from "@esposter/shared";
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// How many of a shader's property names its summary line prints, enough to tell it apart
const SUMMARY_PROPERTY_COUNT = 4;

// One shader's export, its programs carved into a folder of their own, disassembled and decompiled there, and the one
// Summary line that says what it holds
const extractShader = async (
  directory: string,
  blockName: string,
  shaderDirectory: string,
  file: string,
): Promise<string> => {
  const data = await readFile(join(shaderDirectory, file));
  const programDirectory = join(directory, blockName, basename(file, ".dat"));
  await mkdir(programDirectory, { recursive: true });
  const propertyNames = parseShaderProperties(data).map(({ name }) => name);
  const { named, programs } = readShaderPrograms(data);
  await Promise.all([
    writeFile(join(programDirectory, "properties.txt"), propertyNames.join("\n")),
    writeFile(
      join(programDirectory, "programs.tsv"),
      programs
        .map(({ keywords, pass, stage }, index) => [programName(index), pass, stage, keywords.join(" ")].join("\t"))
        .join("\n"),
    ),
    ...programs.map(({ code }, index) => writeFile(join(programDirectory, `${programName(index)}.dxbc`), code)),
  ]);
  const count = disassembleDxbcDirectory(programDirectory);
  // And decompiled to HLSL beside it where the pinned decompiler can be had, the annotated assembly the source
  // Where it cannot
  const decompiledCount = await getResultAsync(() => decompileDxbcDirectory(programDirectory)).match(
    (decompiled) => decompiled,
    (error) => {
      console.error(`${programDirectory}: no HLSL, the assembly stands: ${String(error)}`);
      return 0;
    },
  );
  // Each program's assembly and HLSL are headed by what its constant buffer's registers hold, from its shader's
  // Layouts
  const layouts = parseShaderConstantLayouts(data);
  const assemblyNames = (await readdir(programDirectory)).filter(
    (name) => name.endsWith(".asm") || name.endsWith(".hlsl"),
  );
  await Promise.all(
    assemblyNames.map(async (name) => {
      const path = join(programDirectory, name);
      await writeFile(path, annotateProgramConstants(await readFile(path, "utf8"), layouts));
    }),
  );
  await Promise.all(programs.map((_value, index) => rm(join(programDirectory, `${programName(index)}.dxbc`))));
  return `${blockName}/${basename(file, ".dat")}: ${count} of ${programs.length} programs disassembled, ${decompiledCount} decompiled, ${named ? "each named by pass, stage and keywords" : "unnamed, its serialized form not read"}, ${propertyNames.slice(0, SUMMARY_PROPERTY_COUNT).join(" ")}`;
};

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
