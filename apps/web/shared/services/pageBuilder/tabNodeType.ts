import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

const tabFormSchema = z.strictObject({ label: z.string().min(1) });
const tabPropsSchema = z.object({ ...tabFormSchema.shape, style: nodeStyleSchema.optional() });

// The panel of one tab. Its tab button and whether it is hidden are the Tabs node's, which holds the tabs in order
export const tabNodeType = {
  css: "",
  formSchema: tabFormSchema,
  isFocusable: false,
  propsSchema: tabPropsSchema,
  render: (node, slots) => {
    const id = z.string().parse(node.props.id);
    return {
      attributes: {
        [HtmlAttributeName.AriaLabelledBy]: `${id}-tab`,
        [HtmlAttributeName.Id]: `${id}-panel`,
        [HtmlAttributeName.Role]: "tabpanel",
      },
      children: slots.children ?? [],
      tag: HtmlTag.Div,
    };
  },
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Tab,
} satisfies NodeTypeDefinition;
