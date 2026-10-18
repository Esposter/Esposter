import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockRegistry } from "#src/models/BlockRegistry";

import { blockNodeShapeSchema } from "#src/services/blockNodeShapeSchema";
import { checkBlockNodes } from "#src/services/checkBlockNodes";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { z } from "zod";

// The document's shape, then its registry: the content the root accepts, the root's props its schema passes, every slot
// Holding only the types it allows, unique ids, and the node count staying within the limit the consumer passes
export const createBlockDocumentSchema = (registry: BlockRegistry, maxNodes: number): z.ZodType<BlockDocument> =>
  z
    .object({ content: z.array(blockNodeShapeSchema), root: z.object({ props: z.record(z.string(), z.unknown()) }) })
    .superRefine((document, context) => {
      const collection: BlockCollection = { count: 0, ids: new Set() };
      checkBlockNodes(context, registry, document.content, getRootAcceptedTypes(registry), ["content"], collection);
      if (collection.count > maxNodes)
        context.addIssue({ code: "custom", message: `holds more than ${maxNodes} nodes`, path: ["content"] });

      const propsResult = registry.root.propsSchema.safeParse(document.root.props);
      if (!propsResult.success)
        for (const issue of propsResult.error.issues)
          context.addIssue({ code: "custom", message: issue.message, path: ["root", "props", ...issue.path] });
    });
