import { CAMERA_GLOBAL_CONFIG_FIELDS } from "#src/services/genshinAssets/camera/constants";
import { parseCameraProfile } from "#src/services/genshinAssets/camera/parseCameraProfile";
import { describe, expect, test } from "vitest";

const writeInt32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};
const writeFloat = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeFloatLE(value);
  return bytes;
};

describe(parseCameraProfile, () => {
  // A header whose name does not fill its last word, one module of type 1 and its config of one word
  const header = Buffer.concat([
    Buffer.alloc(28),
    writeInt32(1),
    Buffer.from("a\0\0\0"),
    writeInt32(1),
    writeInt32(1),
    writeInt32(1),
    writeInt32(1),
    Buffer.alloc(4),
  ]);

  test("reads each word of the global config past the module configs, a flag as a whole word", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([
      header,
      ...CAMERA_GLOBAL_CONFIG_FIELDS.map(({ isFlag }) => (isFlag ? writeInt32(1) : writeFloat(-1))),
    ]);

    expect(parseCameraProfile(bytes)).toStrictEqual({
      globalConfig: CAMERA_GLOBAL_CONFIG_FIELDS.map(({ isFlag, name }) => ({ name, value: isFlag ? 1 : -1 })),
      moduleTypes: [1],
    });
  });

  test("throws when a flag reads other than 0 or 1, as a moved global config does", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([header, ...CAMERA_GLOBAL_CONFIG_FIELDS.map(() => writeFloat(-1))]);

    expect(() => parseCameraProfile(bytes)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: CameraProfile, flag SETTING_ALWAYS_SLOPECHECK reads -1082130432]`,
    );
  });
});
