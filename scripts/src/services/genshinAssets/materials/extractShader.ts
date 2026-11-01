import { annotateProgramConstants } from "#src/services/genshinAssets/materials/annotateProgramConstants";
import { decompileDxbcDirectory } from "#src/services/genshinAssets/materials/decompileDxbcDirectory";
import { disassembleDxbcDirectory } from "#src/services/genshinAssets/materials/disassembleDxbcDirectory";
import { parseShaderConstantLayouts } from "#src/services/genshinAssets/materials/parseShaderConstantLayouts";
import { parseShaderProperties } from "#src/services/genshinAssets/materials/parseShaderProperties";
import { programName } from "#src/services/genshinAssets/materials/programName";
import { readShaderPrograms } from "#src/services/genshinAssets/materials/readShaderPrograms";
import { getResultAsync } from "@esposter/shared";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

// How many of a shader's property names its summary line prints, enough to tell it apart
const SUMMARY_PROPERTY_COUNT = 4;

// One shader's export, its programs carved into a folder of their own, disassembled and decompiled there, and the one
// Summary line that says what it holds
export const extractShader = async (
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
