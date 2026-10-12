import type { ShaderProgram } from "#src/models/genshinAssets/materials/ShaderProgram";

import { parseDxbcPrograms } from "#src/services/genshinAssets/materials/parseDxbcPrograms";
import { parseSerializedShader } from "#src/services/genshinAssets/materials/parseSerializedShader";
import { getResult } from "@esposter/shared";

// A shader's compiled programs, each named by the pass and stage it is compiled for and its keyword set, read from its
// Serialized form. The game's other shaders do not all follow that form yet, so one that fails to read keeps its programs
// Carved by their magic and unnamed, so its disassembly still exists, and reports that it is unnamed
export const readShaderPrograms = (data: Buffer): { named: boolean; programs: ShaderProgram[] } =>
  getResult(() => parseSerializedShader(data)).match(
    (shader) => ({
      named: true,
      programs: shader.subShaders.flatMap((subShader) =>
        subShader.passes.flatMap((pass) =>
          Object.entries(pass.subPrograms).flatMap(([stage, subPrograms]) =>
            subPrograms
              .filter((subProgram) => subProgram.code.length > 0)
              .map((subProgram) => ({
                code: subProgram.code,
                keywords: subProgram.keywords.toSorted(),
                pass: pass.name,
                stage,
              })),
          ),
        ),
      ),
    }),
    () => ({
      named: false,
      programs: parseDxbcPrograms(data).map((code) => ({ code, keywords: [], pass: "", stage: "" })),
    }),
  );
