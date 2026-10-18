import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

const tabFormSchema = z.strictObject({ label: z.string().min(1) });
const tabPropsSchema = z.strictObject({ ...tabFormSchema.shape, children: z.array(z.unknown()), id: z.string() });

// The panel of one tab. Its tab button and whether it is hidden are the Tabs node's, which holds the tabs in order
export const tabNodeType = {
  css: "",
  formSchema: tabFormSchema,
  propsSchema: tabPropsSchema,
  render: (node, slots) => {
    const { id } = tabPropsSchema.parse(node.props);
    return {
      attributes: { "aria-labelledby": `${id}-tab`, id: `${id}-panel`, role: "tabpanel" },
      children: slots.children ?? [],
      tag: "div",
    };
  },
  script: undefined,
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Tab,
} satisfies NodeTypeDefinition;
