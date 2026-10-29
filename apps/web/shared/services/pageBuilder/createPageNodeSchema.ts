import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

import { z } from "zod";

// One variant of an editor's node union: its type's literal tag and the props its definition validates
export const createPageNodeSchema = <TNode extends PageNode, TType extends TNode["type"], TProps extends PageNodeProps>(
  definition: NodeTypeDefinition<TNode, TType, TProps>,
  nodeSchema: z.ZodType<TNode>,
) => z.object({ props: definition.createPropsSchema(nodeSchema), type: z.literal(definition.type) });
