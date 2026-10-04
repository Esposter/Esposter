import { parseShaderPropertyNames } from "#src/services/genshinAssets/materials/parseShaderPropertyNames";
import { describe, expect, test } from "vitest";

describe(parseShaderPropertyNames, () => {
  test("reads the names declared ahead of the first program, once each", () => {
    expect.hasAssertions();

    const data = Buffer.from("\u000F\u0000_MainTex\u0000_Tint\u0000_MainTex\u0000DXBC_Hidden", "latin1");

    expect(parseShaderPropertyNames(data)).toStrictEqual(["_MainTex", "_Tint"]);
  });
});
