import type { CameraProfileReading } from "#src/models/genshinAssets/camera/CameraProfileReading";

import { CAMERA_GLOBAL_CONFIG_FIELDS, CAMERA_PROFILE_NAME } from "#src/services/genshinAssets/camera/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

const WORD = 4;
// A MonoBehaviour's raw export leads with its game object and script as pointers and its enabled flag, then its name, a
// Length and that many characters aligned to four
const NAME_LENGTH_OFFSET = 28;
// The camera profile's raw export read past its name: the count of its modules, an array of the module type each
// Config serves, the array of configs, records of one size, and the global config's words last. The configs' size is
// Whatever the global config leaves, so a build that moves the global config throws rather than naming the wrong words:
// The configs no longer divide evenly, or a flag reads other than 0 or 1
export const parseCameraProfile = (bytes: Buffer): CameraProfileReading => {
  const nameLength = bytes.readUInt32LE(NAME_LENGTH_OFFSET);
  const typesOffset = NAME_LENGTH_OFFSET + WORD + Math.ceil(nameLength / WORD) * WORD + WORD;
  const typeCount = bytes.readUInt32LE(typesOffset);
  const moduleTypes = Array.from({ length: typeCount }, (_value, index) =>
    bytes.readInt32LE(typesOffset + (index + 1) * WORD),
  );
  const configsOffset = typesOffset + (typeCount + 1) * WORD;
  const configCount = bytes.readUInt32LE(configsOffset);
  const globalOffset = bytes.length - CAMERA_GLOBAL_CONFIG_FIELDS.length * WORD;
  const configsBytes = globalOffset - configsOffset - WORD;
  if (configCount !== typeCount || configsBytes % (configCount * WORD) !== 0)
    throw new InvalidOperationError(
      Operation.Read,
      CAMERA_PROFILE_NAME,
      `${configCount} configs over ${configsBytes} bytes for ${typeCount} module types`,
    );
  const globalConfig = CAMERA_GLOBAL_CONFIG_FIELDS.map(({ isFlag, name }, index) => {
    const offset = globalOffset + index * WORD;
    const value = isFlag ? bytes.readInt32LE(offset) : bytes.readFloatLE(offset);
    if (isFlag && value !== 0 && value !== 1)
      throw new InvalidOperationError(Operation.Read, CAMERA_PROFILE_NAME, `flag ${name} reads ${value}`);
    return { name, value };
  });
  return { globalConfig, moduleTypes };
};
