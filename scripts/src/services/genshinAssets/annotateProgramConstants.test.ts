import { annotateProgramConstants } from "#src/services/genshinAssets/annotateProgramConstants";
import { describe, expect, test } from "vitest";

describe(annotateProgramConstants, () => {
  const assembly = "dcl_constantbuffer CB0[3], immediateIndexed\nmul r0.xyz, cb0[2].xyzx, cb0[0].wwww";
  const vector = { arrayLength: 0, columns: 3, rows: 1 };

  test("names each register from the layout that covers every one the program reads", () => {
    expect.hasAssertions();

    const layouts = [
      [{ ...vector, byteOffset: 0, name: "_Short" }],
      [
        { ...vector, byteOffset: 0, name: "_Tint" },
        { arrayLength: 0, byteOffset: 12, columns: 1, name: "_Strength", rows: 1 },
        { ...vector, byteOffset: 32, name: "_Direction" },
      ],
    ];

    expect(annotateProgramConstants(assembly, layouts).split("\n").slice(0, 3)).toStrictEqual([
      "// cb0[0].xyz: _Tint",
      "// cb0[0].w: _Strength",
      "// cb0[2].xyz: _Direction",
    ]);
  });

  test("leaves a program no layout covers as it is", () => {
    expect.hasAssertions();

    expect(annotateProgramConstants(assembly, [[{ ...vector, byteOffset: 0, name: "_Tint" }]])).toBe(assembly);
  });
});
