import { parsePmx } from "#src/character/parsePmx";
import { PmxTextEncoding } from "#src/models/character/PmxTextEncoding";
import { PmxWeightDeform } from "#src/models/character/PmxWeightDeform";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A model of so many vertices, each bound to two bones, and twice as many triangles, every other section empty: the
// Vertices and the triangles are what a character's file is made of, 45 bytes a vertex and 12 a triangle
const createPmxBuffer = (vertexCount: number): ArrayBuffer => {
  const indexCount = vertexCount * 6;
  const view = new DataView(new ArrayBuffer(8 + 9 + 16 + 4 + vertexCount * 45 + 4 + indexCount * 4 + 28));
  // The globals past the signature and the version: UTF-16 text, no extra vector, four-byte vertex indices, two-byte
  // Bone indices, and one-byte indices of every other kind
  for (const [index, global] of [8, PmxTextEncoding.Utf16LittleEndian, 0, 4, 1, 1, 2, 1, 1].entries())
    view.setUint8(8 + index, global);
  // The four names and comments are empty
  let offset = 8 + 9 + 16;
  view.setInt32(offset, vertexCount, true);
  offset += 4;
  for (let vertex = 0; vertex < vertexCount; vertex++) {
    for (let component = 0; component < 8; component++) view.setFloat32(offset + component * 4, vertex % 7, true);
    view.setUint8(offset + 32, PmxWeightDeform.TwoBones);
    view.setFloat32(offset + 37, 0.5, true);
    offset += 45;
  }
  view.setInt32(offset, indexCount, true);
  offset += 4;
  for (let index = 0; index < indexCount; index++) view.setUint32(offset + index * 4, index % vertexCount, true);
  // The textures, materials, bones, morphs, display frames, rigid bodies and joints that follow are counted as none
  return view.buffer;
};

// A parse against a structured clone of what it returns, the least an IndexedDB read of the parsed model would cost
describe(parsePmx, () => {
  test.for([100_000, 500_000])("%i vertices", async (vertexCount, { bench }) => {
    const buffer = createPmxBuffer(vertexCount);
    const pmxModel = parsePmx(buffer);
    await bench.compare(
      bench("parsePmx", () => {
        parsePmx(buffer);
      }),
      bench("structuredClone of the parsed model", () => {
        structuredClone(pmxModel);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
