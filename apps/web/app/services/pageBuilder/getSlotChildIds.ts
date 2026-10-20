import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";
import { getBlockNode } from "headless-block-editor";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds = (document: WebpageDocument, slotPointer: string): string[] =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getBlockNode(document, `${slotPointer}/${index}`, webpageNodeChildren)?.props.id)
        .filter((id): id is string => typeof id === "string"),
    () => [],
  );
