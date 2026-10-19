import type { LooseBlockDocument } from "#src/models/LooseBlockDocument";
import type { LooseBlockNode } from "#src/models/LooseBlockNode";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";

// The node a pointer names, or undefined when it names nothing that is a node
export const getBlockNode = (document: LooseBlockDocument, nodePointer: string): LooseBlockNode | undefined =>
  getResult(() => readJsonValue(document, parseJsonPointer(nodePointer))).match(
    (value) => {
      const result = blockNodeShapeSchema.safeParse(value);
      return result.success ? result.data : undefined;
    },
    () => undefined,
  );
