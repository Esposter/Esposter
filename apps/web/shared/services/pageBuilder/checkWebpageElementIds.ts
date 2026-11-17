import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { z } from "zod";

import { webpageNodeChildren } from "#shared/services/pageBuilder/webpageNodeChildren";
import { getBlockSlots } from "vue-block-editor-headless";

// Refuses an element id an earlier node holds, in any slot, since a fragment link goes to the first element with that id.
// Its callers refine only a parse that raised no issue, so the nodes it is handed are the schema's typed output
export const checkWebpageElementIds = (
  context: z.RefinementCtx,
  nodes: readonly WebpageNode[],
  segments: PropertyKey[],
  elementIds: Set<string>,
): void => {
  for (const [index, node] of nodes.entries()) {
    const nodeSegments = [...segments, index];
    const { elementId } = node.props;
    if (elementId && elementIds.has(elementId))
      context.addIssue({
        code: "custom",
        message: "repeats an element id",
        path: [...nodeSegments, "props", "elementId"],
      });
    else if (elementId) elementIds.add(elementId);

    for (const [slot, slotNodes] of Object.entries(getBlockSlots(webpageNodeChildren, node)))
      checkWebpageElementIds(context, slotNodes, [...nodeSegments, "props", slot], elementIds);
  }
};
