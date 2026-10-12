import { ShaderPropertyType } from "#src/models/genshinAssets/materials/ShaderPropertyType";
import { parseShaderProperties } from "#src/services/genshinAssets/materials/parseShaderProperties";
import { describe, expect, test } from "vitest";

// The fixture is written in the layout the parser reads, from synthetic values only, so no game bytes are in the repo
const align = (bytes: Buffer): Buffer => Buffer.concat([bytes, Buffer.alloc((4 - (bytes.length % 4)) % 4)]);
const int32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};
const string = (value: string): Buffer => align(Buffer.concat([int32(value.length), Buffer.from(value)]));
const property = (name: string, type: ShaderPropertyType, flags: number, attributes: string[]): Buffer =>
  Buffer.concat([
    string(name),
    string("A description"),
    int32(attributes.length),
    ...attributes.map((attribute) => string(attribute)),
    int32(type),
    int32(flags),
    Buffer.alloc(16),
    string(""),
    int32(1),
  ]);

describe(parseShaderProperties, () => {
  test("reads each property's name, type and flags past its description, attributes and defaults", () => {
    expect.hasAssertions();

    const data = Buffer.concat([
      string(""),
      int32(2),
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
