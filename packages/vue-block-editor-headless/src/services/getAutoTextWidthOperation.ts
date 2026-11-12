import type { TextSize } from "#src/models/TextSize";
import type { JsonPatchOperation } from "@esposter/shared";

import { getAutoTextWidth } from "#src/services/export/getAutoTextWidth";
import { getElementPointer } from "#src/services/getElementPointer";
import { JsonPatchOperationType } from "@esposter/shared";

// The operation that sets the width of the unwrapped text box at an index to the width its text takes at a size
export const getAutoTextWidthOperation = (index: number, text: string, textSize: TextSize): JsonPatchOperation => ({
  op: JsonPatchOperationType.Replace,
  path: `${getElementPointer(index)}/width`,
  value: getAutoTextWidth(text, textSize),
});
