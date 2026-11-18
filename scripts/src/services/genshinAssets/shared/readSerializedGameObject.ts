import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

import { SERIALIZED_POINTER_BYTES } from "#src/services/genshinAssets/shared/constants";
import { readObjectPointer } from "#src/services/genshinAssets/shared/readObjectPointer";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The game object a serialized component names by the pointer its bytes lead with, which a raw export must hold, and
// Which `label` names in the error when it does not
export const readSerializedGameObject = (bytes: Buffer, label: string): ObjectPointer => {
  if (bytes.length < SERIALIZED_POINTER_BYTES)
    throw new InvalidOperationError(
      Operation.Read,
      label,
      `holds ${bytes.length} bytes, too few for its game object's pointer`,
    );
  return readObjectPointer(bytes, 0);
};
