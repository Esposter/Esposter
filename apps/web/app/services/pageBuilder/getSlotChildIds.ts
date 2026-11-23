import type { PageBuilderHelper } from "#src/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "#src/services/pageBuilder/getNodeIdAt";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds: PageBuilderHelper<string[], [slotPointer: string]> = (kind, document, slotPointer) =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getNodeIdAt(kind, document, `${slotPointer}/${index}`))
        // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a node id, never typed
        .filter((id) => id !== ""),
    // A slot the document does not hold has no children, so a pointer that does not resolve reads as none
    () => [],
  );
