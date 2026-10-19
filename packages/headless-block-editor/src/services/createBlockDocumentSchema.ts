import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { checkBlockNodeIds } from "#src/services/checkBlockNodeIds";
import { createBlockNodeSchema } from "#src/services/createBlockNodeSchema";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { z } from "zod";

// The document's content as the typed node schema over the root's accepted types, with the root's props parsed by the root's own schema,
// Then one refinement over the parsed tree: ids unique across every slot and the node count staying within the limit the consumer passes
export const createBlockDocumentSchema = <TNode extends BlockNode, TRootProps extends Record<string, unknown>>(
  registry: BlockRegistry<TNode, TRootProps>,
  maxNodes: number,
): z.ZodType<BlockDocument<TNode, TRootProps>> =>
  z
    .object({
      content: z.array(createBlockNodeSchema(registry, getRootAcceptedTypes(registry))),
      root: z.object({ props: registry.root.propsSchema }),
    })
    .superRefine((document, context) => {
      const collection: BlockCollection = { count: 0, ids: new Set() };
      checkBlockNodeIds(context, registry, document.content, ["content"], collection);
      if (collection.count > maxNodes)
        context.addIssue({ code: "custom", message: `holds more than ${maxNodes} nodes`, path: ["content"] });
    });
