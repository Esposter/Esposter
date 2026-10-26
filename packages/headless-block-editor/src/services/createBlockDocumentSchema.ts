import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockCollection } from "#src/models/BlockCollection";
import type { BlockDocument } from "#src/models/BlockDocument";
import type { BlockDocumentInput } from "#src/models/BlockDocumentInput";
import type { BlockNode } from "#src/models/BlockNode";
import type { BlockRegistry } from "#src/models/BlockRegistry";
import type { BlockRootProps } from "#src/models/BlockRootProps";

import { checkBlockNodeIds } from "#src/services/checkBlockNodeIds";
import { z } from "zod";

// The document's content as the consumer's root content schema, which takes only the types the root accepts, so an agent's
// JSON Schema and the check agree. The root's props parse by the consumer's typed root schema, then one refinement runs over
// The parsed tree: ids unique across every slot, and the node count staying within the limit the consumer passes
// The refinement runs only on a parse that raised no issue, so the tree it walks is the schema's typed output and not a partial one
export const createBlockDocumentSchema = <TNode extends BlockNode, TRootProps extends BlockRootProps>(
  contentSchema: z.ZodType<TNode>,
  registry: BlockRegistry<TNode, TRootProps>,
  children: BlockChildren<TNode>,
  maxNodes: number,
): z.ZodType<BlockDocument<TNode, TRootProps>, BlockDocumentInput> =>
  z
    .object({ content: z.array(contentSchema).max(maxNodes), root: z.object({ props: registry.root.propsSchema }) })
    .superRefine(
      (document, context) => {
        const collection: BlockCollection = { count: 0, ids: new Set() };
        checkBlockNodeIds(context, registry, children, document.content, ["content"], collection);
        if (collection.count > maxNodes)
          context.addIssue({ code: "custom", message: `holds more than ${maxNodes} nodes`, path: ["content"] });
      },
      { when: ({ issues }) => issues.length === 0 },
    );
