import { annotateProgramConstants } from "#src/services/genshinAssets/materials/annotateProgramConstants";
import { describe, expect, test } from "vitest";

describe(annotateProgramConstants, () => {
  const assembly = "dcl_constantbuffer CB0[3], immediateIndexed\nmul r0.xyz, cb0[2].xyzx, cb0[0].wwww";
  const vector = { arrayLength: 0, columns: 3, rows: 1 };

  // The same program as Windows' disassembler writes it, as 3Dmigoto decompiles it with no names of its own, and as
  // Vkd3d writes its shader model 6 build
  const hlsl = "cbuffer cb0 : register(b0)\n{\n  float4 cb0[3];\n}\no0.xyz = cb0[2].xyz * cb0[0].www;";
  const dxil = "dcl_constantBuffer cb0[0:0][3], immediateIndexed, space=0\nmul sr0.xyz, cb0[0][2].xyzx, cb0[0][0].wwww";

  test.each([assembly, hlsl, dxil])(
    "names each register of %s from the layout that covers every one it reads",
    (program) => {
      expect.hasAssertions();

      const layouts = [
        [{ ...vector, byteOffset: 0, name: "_Short" }],
        [
          { ...vector, byteOffset: 0, name: "_Tint" },
          { arrayLength: 0, byteOffset: 12, columns: 1, name: "_Strength", rows: 1 },
          { ...vector, byteOffset: 32, name: "_Direction" },
        ],
      ];

      expect(annotateProgramConstants(program, layouts).split("\n").slice(0, 3)).toStrictEqual([
        "// cb0[0].xyz: _Tint",
        "// cb0[0].w: _Strength",
        "// cb0[2].xyz: _Direction",
      ]);
    },
  );

  test("names the registers of an assembly written in vkd3d's casing", () => {
    expect.hasAssertions();

    const layouts = [[{ ...vector, byteOffset: 0, name: "_Tint" }]];

    expect(
      annotateProgramConstants("dcl_constantBuffer cb0[3], immediateIndexed\nmov r0.xyz, cb0[0].xyzx", layouts).split(
        "\n",
      )[0],
    ).toBe("// cb0[0].xyz: _Tint");
  });

  test("leaves a program no layout covers as it is", () => {
    expect.hasAssertions();

    expect(annotateProgramConstants(assembly, [[{ ...vector, byteOffset: 0, name: "_Tint" }]])).toBe(assembly);
  });

  test("leaves a program whose only covering layout overlaps a matrix's later registers as it is", () => {
    expect.hasAssertions();

    const layouts = [
      [
        { arrayLength: 0, byteOffset: 0, columns: 4, name: "_Matrix", rows: 3 },
        { ...vector, byteOffset: 16, name: "_Tint" },
      ],
    ];

    expect(annotateProgramConstants(assembly, layouts)).toBe(assembly);
  });
});
