import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The node a pointer names, or undefined when it names nothing that is a node
export const getBlockNode = (document: BlockDocument, nodePointer: string): BlockNode | undefined =>
  getResult(() => readJsonValue(document, parseJsonPointer(nodePointer))).match(
    (value) => {
      const result = blockNodeShapeSchema.safeParse(value);
      return result.success ? result.data : undefined;
    },
    () => undefined,
  );
