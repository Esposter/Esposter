import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockRootProps } from "#src/models/BlockRootProps";

import { checkAcceptedType } from "#src/services/checkAcceptedType";
import { checkBlockNodeIds } from "#src/services/checkBlockNodeIds";
import { getRootAcceptedTypes } from "#src/services/getRootAcceptedTypes";
import { z } from "zod";

// The document's content as the consumer's typed node schema, with the root's props parsed by the consumer's typed root schema,
// Then one refinement over the parsed tree: the root's content types, ids unique across every slot and the node count staying within the limit the consumer passes
// The refinement runs only on a parse that raised no issue, so the tree it walks is the schema's typed output and not a partial one
export const createBlockDocumentSchema = <TNode extends BlockNode, TRootProps extends BlockRootProps>(
  registry: BlockRegistry<TNode, TRootProps>,
  nodeSchema: z.ZodType<TNode>,
  rootPropsSchema: z.ZodType<TRootProps>,
  children: BlockChildren<TNode>,
  maxNodes: number,
): z.ZodType<BlockDocument<TNode, TRootProps>> =>
  z.object({ content: z.array(nodeSchema), root: z.object({ props: rootPropsSchema }) }).superRefine(
    (document, context) => {
      const acceptedTypes = getRootAcceptedTypes(registry);
      for (const [index, node] of document.content.entries())
        checkAcceptedType(context, node.type, acceptedTypes, ["content", index]);
      if (context.issues.length > 0) return;

      const collection: BlockCollection = { count: 0, ids: new Set() };
      checkBlockNodeIds(context, children, document.content, ["content"], collection);
      if (collection.count > maxNodes)
        context.addIssue({ code: "custom", message: `holds more than ${maxNodes} nodes`, path: ["content"] });
    },
    { when: ({ issues }) => issues.length === 0 },
  );
