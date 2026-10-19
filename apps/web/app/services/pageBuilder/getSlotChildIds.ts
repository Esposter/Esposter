import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds = (document: WebpageDocument, slotPointer: string): string[] =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_, index) => getBlockNode(document, `${slotPointer}/${index}`)?.props.id)
        .filter((id): id is string => typeof id === "string"),
    () => [],
  );
