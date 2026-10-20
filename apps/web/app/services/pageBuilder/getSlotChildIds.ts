import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds = (document: WebpageDocument, slotPointer: string): string[] =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getNodeIdAt(document, `${slotPointer}/${index}`))
        .filter((id) => id !== ""),
    () => [],
  );
