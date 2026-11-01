import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockLayerRow } from "#src/models/BlockLayerRow";
import type { BlockNode } from "#src/models/BlockNode";

import { getChildRows } from "#src/services/getChildRows";

// Every node of a document in document order: a node's row comes before the rows of its slots, and the root's content is depth 0
export const getBlockLayerRows = <TNode extends BlockNode>(
  document: BlockDocument<TNode>,
  children: BlockChildren<TNode>,
): BlockLayerRow[] => getChildRows(children, document.content, "/content", 0);
