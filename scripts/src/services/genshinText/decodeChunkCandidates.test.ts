import { decodeChunkCandidates } from "#src/services/genshinText/decodeChunkCandidates";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// The two index rows named 1e3e745b: an ES medium chunk, and an unrelated asset in another block
const SHARED_NAME_ROWS = [
  { block: "05/24113054.blk", pathId: "255" },
  { block: "00/24230448.blk", pathId: "147557" },
];
const REFUSAL = "is truncated at entry 0";
const decodeOnlyUnrelatedRow = ({ block }: { block: string }): Map<string, string> => {
  if (block === "05/24113054.blk") throw new InvalidOperationError(Operation.Read, "text map", REFUSAL);
  return new Map([["1", "A line"]]);
};

describe(decodeChunkCandidates, () => {
  test("a name two rows share decodes the row the decoder accepts", () => {
    expect.hasAssertions();

    expect(decodeChunkCandidates(SHARED_NAME_ROWS, decodeOnlyUnrelatedRow)).toStrictEqual({
      ok: true,
      textMap: new Map([["1", "A line"]]),
    });
  });

  test("a chunk no row decodes keeps the reason each row was refused for", () => {
    expect.hasAssertions();

    expect(
      decodeChunkCandidates(SHARED_NAME_ROWS, () => {
        throw new InvalidOperationError(Operation.Read, "text map", REFUSAL);
      }),
    ).toStrictEqual({
      ok: false,
      reasons: [
        `Invalid operation: Read, name: text map, ${REFUSAL}`,
        `Invalid operation: Read, name: text map, ${REFUSAL}`,
      ],
    });
  });
});
