import { parseSerializedShader } from "#src/services/genshinAssets/materials/parseSerializedShader";
import { describe, expect, test } from "vitest";

// The fixture is written in the layout the parser reads, from synthetic values only, so no game bytes are in the repo
const align = (bytes: Buffer): Buffer => Buffer.concat([bytes, Buffer.alloc((4 - (bytes.length % 4)) % 4)]);
const int32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};
const uint32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32LE(value);
  return bytes;
};
const string = (value: string): Buffer => align(Buffer.concat([int32(value.length), Buffer.from(value)]));
const list = (items: Buffer[]): Buffer => Buffer.concat([int32(items.length), ...items]);
const uint32List = (values: number[]): Buffer => list(values.map((value) => uint32(value)));
const uint16List = (values: number[]): Buffer => {
  const body = Buffer.alloc(values.length * 2);
  for (const [index, value] of values.entries()) body.writeUInt16LE(value, index * 2);
  return align(Buffer.concat([int32(values.length), body]));
};
const uint8List = (bytes: Buffer): Buffer => align(Buffer.concat([int32(bytes.length), bytes]));
// A render state is its name and then 708 bytes of zeroes: every float value is a zero float with an empty name, and every
// Other name is empty
const RENDER_STATE_BYTES = 712;
const EMPTY_PARAMETER_LISTS_BYTES = 32;
const TRAILER_BYTES = 24;
const subProgram = (blobIndex: number, gpuProgramType: number, keywordIndices: number[]): Buffer =>
  Buffer.concat([
    uint32(blobIndex),
    Buffer.alloc(4),
    Buffer.alloc(16),
    int32(0),
    int32(0),
    uint32(0),
    uint16List(keywordIndices),
    uint16List([]),
    Buffer.from([0, gpuProgramType, 0, 0]),
    Buffer.alloc(EMPTY_PARAMETER_LISTS_BYTES),
    int32(0),
    Buffer.alloc(TRAILER_BYTES),
  ]);
// A pass's trailer is one zero word or two, as the game writes it, and two is the usual one
const pass = (
  name: string,
  keywords: [string, number][],
  stages: { fragment: Buffer[]; geometry: Buffer[]; vertex: Buffer[] },
  trailerWords: 1 | 2 = 2,
): Buffer =>
  Buffer.concat([
    list(keywords.map(([keyword, index]) => Buffer.concat([string(keyword), int32(index)]))),
    int32(0),
    string(name),
    Buffer.alloc(RENDER_STATE_BYTES - 4),
    uint32(0),
    list(stages.vertex),
    list(stages.fragment),
    list(stages.geometry),
    list([]),
    list([]),
    list([]),
    Buffer.alloc(4),
    string(""),
    string(""),
    string(""),
    list([]),
    ...Array.from({ length: trailerWords }, () => int32(0)),
  ]);
// A program's container is its magic and some bytes of the game's own, and a blob chunk is its entry count, each entry's
// Offset and length, then each program's header and container
const payload = (text: string): Buffer => Buffer.concat([Buffer.from("DXBC"), Buffer.from(text)]);
const blobChunk = (programs: { code: Buffer; gpuProgramType: number }[]): Buffer => {
  const bodies = programs.map(({ code, gpuProgramType }) =>
    Buffer.concat([
      int32(201_806_140),
      int32(gpuProgramType),
      Buffer.alloc(12),
      Buffer.alloc(4),
      list([]),
      list([]),
      uint8List(code),
    ]),
  );
  let offset = 4 + programs.length * 8;
  const entries = bodies.map((body) => {
    const entry = Buffer.concat([int32(offset), int32(body.length)]);
    offset += body.length;
    return entry;
  });
  return Buffer.concat([int32(programs.length), ...entries, ...bodies]);
};

describe(parseSerializedShader, () => {
  test("reads a pass whose trailer is one word, so the next pass starts right after it", () => {
    expect.hasAssertions();

    const blob = blobChunk([{ code: payload("vertex-a"), gpuProgramType: 16 }]);
    const stages = { fragment: [], geometry: [], vertex: [subProgram(0, 16, [1])] };
    const shader = Buffer.concat([
      string(""),
      list([]),
      list([
        Buffer.concat([
          list([
            pass(
              "DEFERRED",
              [
                ["$Globals", 0],
                ["DEFERRED_ON", 1],
              ],
              stages,
              1,
            ),
            pass(
              "FORWARD",
              [
                ["$Globals", 0],
                ["FORWARD_ON", 1],
              ],
              stages,
              2,
            ),
          ]),
          list([]),
          int32(0),
        ]),
      ]),
      string("miHoYo/Test"),
      string(""),
      string(""),
      list([]),
      Buffer.alloc(4),
      uint32List([4, 23]),
      uint32List([0, blob.length]),
      uint32List([blob.length, 0]),
      uint32List([blob.length, 0]),
      uint8List(blob),
    ]);

    const passes = parseSerializedShader(shader).subShaders[0]?.passes ?? [];
    expect(passes.map(({ name }) => name)).toStrictEqual(["DEFERRED", "FORWARD"]);
  });

  test("reads each pass's keyword names and resolves each stage's program code from its platform's blob chunk", () => {
    expect.hasAssertions();

    const d3d11 = blobChunk([
      { code: payload("vertex-a"), gpuProgramType: 16 },
      { code: payload("fragment-b"), gpuProgramType: 18 },
      { code: Buffer.alloc(0), gpuProgramType: 16 },
    ]);
    const ps5 = blobChunk([{ code: payload("geometry-c"), gpuProgramType: 26 }]);
    const blob = Buffer.concat([d3d11, ps5]);
    const shader = Buffer.concat([
      string(""),
      list([]),
      list([
        Buffer.concat([
          list([
            pass(
              "BODY",
              [
                ["$Globals", 0],
                ["BACK_FACE_ON", 1],
                ["TOON_LIGHTMAP_ON", 2],
              ],
              {
                fragment: [subProgram(1, 18, [1, 2])],
                geometry: [subProgram(0, 26, [])],
                vertex: [subProgram(0, 16, [1]), subProgram(2, 16, [])],
              },
            ),
          ]),
          list([]),
          int32(0),
        ]),
      ]),
      string("miHoYo/Test"),
      string(""),
      string(""),
      list([]),
      Buffer.alloc(4),
      uint32List([4, 23]),
      uint32List([0, d3d11.length]),
      uint32List([d3d11.length, ps5.length]),
      uint32List([d3d11.length, ps5.length]),
      uint8List(blob),
    ]);

    expect(parseSerializedShader(shader)).toStrictEqual({
      name: "miHoYo/Test",
      subShaders: [
        {
          passes: [
            {
              keywordNames: new Map([
                [0, "$Globals"],
                [1, "BACK_FACE_ON"],
                [2, "TOON_LIGHTMAP_ON"],
              ]),
              name: "BODY",
              subPrograms: {
                Domain: [],
                Fragment: [
                  {
                    blobIndex: 1,
                    code: payload("fragment-b"),
                    gpuProgramType: 18,
                    keywordIndices: [1, 2],
                    keywords: ["BACK_FACE_ON", "TOON_LIGHTMAP_ON"],
                  },
                ],
                Geometry: [
                  { blobIndex: 0, code: payload("geometry-c"), gpuProgramType: 26, keywordIndices: [], keywords: [] },
                ],
                Hull: [],
                Vertex: [
                  {
                    blobIndex: 0,
                    code: payload("vertex-a"),
                    gpuProgramType: 16,
                    keywordIndices: [1],
                    keywords: ["BACK_FACE_ON"],
                  },
                  { blobIndex: 2, code: Buffer.alloc(0), gpuProgramType: 16, keywordIndices: [], keywords: [] },
                ],
              },
            },
          ],
        },
      ],
    });
  });
});
