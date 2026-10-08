import { readMaterialKeywords } from "#src/services/genshinAssets/shared/readMaterialKeywords";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test } from "vitest";

// A string as Unity serializes it: its length, its characters, and padding to four bytes
const serializeString = (value: string): Buffer => {
  const length = Buffer.alloc(4);
  length.writeUInt32LE(value.length);
  return Buffer.concat([length, Buffer.from(value, "latin1"), Buffer.alloc((4 - (value.length % 4)) % 4)]);
};

describe(readMaterialKeywords, () => {
  test("reads the keywords past a name of any length and the shader's pointer", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([serializeString("a"), Buffer.alloc(12), serializeString("A B")]);

    expect(readMaterialKeywords(bytes)).toStrictEqual(["A", "B"]);
  });

  test("reads no keyword where the material sets none", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([serializeString("ab"), Buffer.alloc(12), serializeString("")]);

    expect(readMaterialKeywords(bytes)).toStrictEqual([]);
  });

  test("throws on bytes ending before their keywords do", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([serializeString("a"), Buffer.alloc(12), serializeString("A B").subarray(0, 6)]);

    expect(() => readMaterialKeywords(bytes)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, readMaterialKeywords.name, `keywords end at byte ${bytes.length + 1} of ${bytes.length}`).message}]`,
    );
  });
});
