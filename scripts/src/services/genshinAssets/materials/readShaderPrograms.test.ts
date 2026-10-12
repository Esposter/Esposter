import { parseDxbcPrograms } from "#src/services/genshinAssets/materials/parseDxbcPrograms";
import { readShaderPrograms } from "#src/services/genshinAssets/materials/readShaderPrograms";
import { describe, expect, test } from "vitest";

describe(readShaderPrograms, () => {
  test("carves unnamed programs by their magic when the shader's serialized form is not read", () => {
    expect.hasAssertions();

    const program = Buffer.alloc(40);
    program.write("DXBC", "ascii");
    program.writeUInt32LE(40, 24);
    const data = Buffer.concat([Buffer.from("xxxxxxxx"), program]);

    expect(readShaderPrograms(data)).toStrictEqual({
      named: false,
      programs: parseDxbcPrograms(data).map((code) => ({ code, keywords: [], pass: "", stage: "" })),
    });
  });
});
