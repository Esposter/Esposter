import type { PageBuilderKind } from "@/models/pageBuilder/PageBuilderKind";
import type { BlockDocument, BlockNode, BlockRootProps, BlockTypeDefinition } from "headless-block-editor";

import { getNodeIdAt } from "@/services/pageBuilder/getNodeIdAt";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The ids of a slot's children in order, read from the document. A child without an id contributes none
export const getSlotChildIds = <
  TNode extends BlockNode,
  TRoot extends BlockRootProps,
  TDefinition extends BlockTypeDefinition<TNode>,
  TDocument extends BlockDocument<TNode, TRoot>,
>(
  kind: PageBuilderKind<TNode, TRoot, TDefinition, TDocument>,
  document: TDocument,
  slotPointer: string,
): string[] =>
  getResult(() => readJsonValue(document, parseJsonPointer(slotPointer))).match(
    (value) =>
      (Array.isArray(value) ? value : [])
        .map((_value, index) => getNodeIdAt(kind, document, `${slotPointer}/${index}`))
        .filter((id) => id !== ""),
    () => [],
  );
