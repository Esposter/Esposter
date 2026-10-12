import type { SerializedBlobProgram } from "#src/models/genshinAssets/materials/SerializedBlobProgram";
import type { SerializedPass } from "#src/models/genshinAssets/materials/SerializedPass";
import type { SerializedPassRecord } from "#src/models/genshinAssets/materials/SerializedPassRecord";
import type { SerializedShader } from "#src/models/genshinAssets/materials/SerializedShader";
import type { SerializedSubProgram } from "#src/models/genshinAssets/materials/SerializedSubProgram";
import type { SerializedSubProgramRecord } from "#src/models/genshinAssets/materials/SerializedSubProgramRecord";
import type { SerializedSubShader } from "#src/models/genshinAssets/materials/SerializedSubShader";
import type { SerializedSubShaderRecord } from "#src/models/genshinAssets/materials/SerializedSubShaderRecord";

import { BinaryCursor } from "#src/models/genshinAssets/materials/BinaryCursor";
import { ShaderProgramStage } from "#src/models/genshinAssets/materials/ShaderProgramStage";
import { readSerializedBlobChunk } from "#src/services/genshinAssets/materials/readSerializedBlobChunk";
import { readSerializedPass } from "#src/services/genshinAssets/materials/readSerializedPass";
import { readShaderProperty } from "#src/services/genshinAssets/materials/readShaderProperty";
import { skipTagMap } from "#src/services/genshinAssets/materials/skipTagMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The blob's chunks by platform: Direct3D 11 for the earlier GPU program types, PlayStation 5 for the later ones, which
// AnimeStudio's CheckGpuProgramUsable routes the same way
const PLATFORM_D3D11 = 4;
const PLATFORM_PS5 = 23;
const PS5_GPU_PROGRAM_TYPE_MIN = 26;

const readSubShader = (cursor: BinaryCursor): SerializedSubShaderRecord => {
  const passes = cursor.list(() => readSerializedPass(cursor));
  skipTagMap(cursor);
  cursor.int32();
  return { passes };
};
// Reads a shader's raw export: its subshaders as the passes name their keywords and stage programs, then the blob that
// Holds each program's container, which the programs' blob indices select within their platform's chunk
export const parseSerializedShader = (data: Buffer): SerializedShader => {
  const cursor = new BinaryCursor(data);
  cursor.string();
  cursor.list(() => readShaderProperty(cursor));
  const subShaders = cursor.list(() => readSubShader(cursor));
  const name = cursor.string();
  cursor.string();
  cursor.string();
  cursor.list(() => {
    cursor.string();
    cursor.string();
  });
  cursor.bool();
  cursor.align();
  const platforms = cursor.uint32List();
  const offsets = cursor.uint32List();
  cursor.uint32List();
  const decompressedLengths = cursor.uint32List();
  let blob = cursor.uint8List();
  if (blob.readInt32LE(0) === -1) blob = cursor.uint8List();

  const chunks = new Map<number, SerializedBlobProgram[]>();
  const readBlobPrograms = (gpuProgramType: number): SerializedBlobProgram[] => {
    const platform = gpuProgramType >= PS5_GPU_PROGRAM_TYPE_MIN ? PLATFORM_PS5 : PLATFORM_D3D11;
    const index = platforms.indexOf(platform);
    if (index === -1)
      throw new InvalidOperationError(
        Operation.Read,
        parseSerializedShader.name,
        `no blob chunk for platform ${platform}`,
      );
    const cached = chunks.get(index);
    if (cached) return cached;
    const start = offsets[index] ?? 0;
    const chunk = readSerializedBlobChunk(blob.subarray(start, start + (decompressedLengths[index] ?? 0)));
    chunks.set(index, chunk);
    return chunk;
  };
  const resolveSubProgram = (
    record: SerializedSubProgramRecord,
    keywordNames: Map<number, string>,
  ): SerializedSubProgram => {
    const program = readBlobPrograms(record.gpuProgramType)[record.blobIndex];
    if (!program)
      throw new InvalidOperationError(
        Operation.Read,
        parseSerializedShader.name,
        `blob index ${record.blobIndex} is absent`,
      );
    return {
      blobIndex: record.blobIndex,
      code: program.code,
      gpuProgramType: program.gpuProgramType,
      keywordIndices: record.keywordIndices,
      keywords: record.keywordIndices.map((index) => {
        const keyword = keywordNames.get(index);
        if (keyword === undefined)
          throw new InvalidOperationError(
            Operation.Read,
            parseSerializedShader.name,
            `keyword index ${index} is absent`,
          );
        return keyword;
      }),
    };
  };
  const resolveStage = (records: SerializedSubProgramRecord[], keywordNames: Map<number, string>) =>
    records.map((record) => resolveSubProgram(record, keywordNames));
  const resolvePass = (pass: SerializedPassRecord): SerializedPass => {
    const { keywordNames } = pass;
    const stages: Record<ShaderProgramStage, SerializedSubProgram[]> = {
      [ShaderProgramStage.Domain]: resolveStage(pass.subPrograms[ShaderProgramStage.Domain], keywordNames),
      [ShaderProgramStage.Fragment]: resolveStage(pass.subPrograms[ShaderProgramStage.Fragment], keywordNames),
      [ShaderProgramStage.Geometry]: resolveStage(pass.subPrograms[ShaderProgramStage.Geometry], keywordNames),
      [ShaderProgramStage.Hull]: resolveStage(pass.subPrograms[ShaderProgramStage.Hull], keywordNames),
      [ShaderProgramStage.Vertex]: resolveStage(pass.subPrograms[ShaderProgramStage.Vertex], keywordNames),
    };
    return { keywordNames, name: pass.name, subPrograms: stages };
  };
  const resolveSubShader = (subShader: SerializedSubShaderRecord): SerializedSubShader => ({
    passes: subShader.passes.map((pass) => resolvePass(pass)),
  });
  return { name, subShaders: subShaders.map((subShader) => resolveSubShader(subShader)) };
};
