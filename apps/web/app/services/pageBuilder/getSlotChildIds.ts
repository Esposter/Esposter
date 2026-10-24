import type { PageBuilderHelper } from "@/models/pageBuilder/PageBuilderHelper";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds: PageBuilderHelper<string[], [slotPointer: string]> = (kind, document, slotPointer) =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getNodeIdAt(kind, document, `${slotPointer}/${index}`))
        .filter((id) => id !== ""),
    () => [],
  );
