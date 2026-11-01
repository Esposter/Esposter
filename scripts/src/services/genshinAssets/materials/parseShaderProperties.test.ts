import { ShaderPropertyType } from "#src/models/genshinAssets/materials/ShaderPropertyType";
import { createInt32 } from "#src/services/genshinAssets/materials/createInt32.test";
import { createString } from "#src/services/genshinAssets/materials/createString.test";
import { parseShaderProperties } from "#src/services/genshinAssets/materials/parseShaderProperties";
import { describe, expect, test } from "vitest";

// The fixture is written in the layout the parser reads, from synthetic values only, so no game bytes are in the repo
const property = (name: string, type: ShaderPropertyType, flags: number, attributes: string[]): Buffer =>
  Buffer.concat([
    createString(name),
    createString("A description"),
    createInt32(attributes.length),
    ...attributes.map((attribute) => createString(attribute)),
    createInt32(type),
    createInt32(flags),
    Buffer.alloc(16),
    createString(""),
    createInt32(1),
  ]);

describe(parseShaderProperties, () => {
  test("reads each property's name, type and flags past its description, attributes and defaults", () => {
    expect.hasAssertions();

    const data = Buffer.concat([
      createString(""),
      createInt32(2),
      property("_Tint", ShaderPropertyType.Color, 32, ["Gamma"]),
      property("_Knots", ShaderPropertyType.Vector, 0, []),
      Buffer.from("DXBC"),
    ]);

    expect(parseShaderProperties(data)).toStrictEqual([
      { flags: 32, name: "_Tint", type: ShaderPropertyType.Color },
      { flags: 0, name: "_Knots", type: ShaderPropertyType.Vector },
    ]);
  });
});
