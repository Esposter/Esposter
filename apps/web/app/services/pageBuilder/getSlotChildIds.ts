import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds = (kind: PageBuilderKind, document: WebpageDocument, slotPointer: string): string[] =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getNodeIdAt(kind, document, `${slotPointer}/${index}`))
        .filter((id) => id !== ""),
    () => [],
  );
