import type { NodeSlot } from "#shared/models/pageBuilder/NodeSlot";
import type { PageDocument } from "#shared/models/pageBuilder/PageDocument";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";

import { MAX_PAGE_NODE_COUNT } from "#shared/services/pageBuilder/constants";
import { createSlotSchema } from "#shared/services/pageBuilder/createSlotSchema";
import { getNodeTypeDefinition } from "#shared/services/pageBuilder/getNodeTypeDefinition";
import { z } from "zod";

// The node union checks every type's props; the walk here checks what spans nodes — each slot's allow list, ids unique
// Across the whole document, and the node count
export const createPageDocumentSchema = <TRootProps, TNode extends PageNode>(
  rootPropsSchema: z.ZodType<TRootProps>,
  nodeSchema: z.ZodType<TNode>,
  definitionMap: PageNodeDefinitionMap<TNode>,
  rootSlot: NodeSlot<TNode["type"]>,
): z.ZodType<PageDocument<TRootProps, TNode>> =>
  z
    .object({ content: createSlotSchema(nodeSchema), root: z.object({ props: rootPropsSchema }) })
    .superRefine((document, context) => {
      const ids = new Set<string>();
      const checkSlot = (nodes: TNode[], slot: NodeSlot<TNode["type"]>, path: PropertyKey[]) => {
        for (const [index, node] of nodes.entries()) {
          const nodePath = [...path, index];
          if (!slot.allow.includes(node.type))
            context.addIssue({ code: "custom", message: `${node.type} cannot be placed here`, path: nodePath });
          if (ids.has(node.props.id))
            context.addIssue({
              code: "custom",
              message: "Node ids must be unique",
              path: [...nodePath, "props", "id"],
            });
          ids.add(node.props.id);

          for (const [slotKey, childSlot] of Object.entries<NodeSlot<TNode["type"]>>(
            getNodeTypeDefinition(definitionMap, node).slots,
          ))
            checkSlot(Reflect.get(node.props, slotKey) as TNode[], childSlot, [...nodePath, "props", slotKey]);
        }
      };
      checkSlot(document.content, rootSlot, ["content"]);
      if (ids.size > MAX_PAGE_NODE_COUNT)
        context.addIssue({ code: "custom", message: `A page holds at most ${MAX_PAGE_NODE_COUNT} nodes`, path: [] });
    });
