import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { TabNode } from "#shared/models/pageBuilder/TabNode";
import type { TabNodeProps } from "#shared/models/pageBuilder/TabNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { z } from "zod";

const tabFormSchema = z.strictObject({ label: nodeTextSchema });
const tabPropsSchema = z.object({ ...tabFormSchema.shape, style: nodeStyleSchema.optional() }) satisfies z.ZodType<
  OwnProps<TabNodeProps>
>;

// The panel of one tab. Its tab button and whether it is hidden are the Tabs node's, which holds the tabs in order
export const tabNodeType = {
  css: "",
  formSchema: tabFormSchema,
  isFocusable: false,
  propsSchema: tabPropsSchema,
  render: (node, slots) => ({
    attributes: {
      [HtmlAttributeName.AriaLabelledBy]: `${node.props.id}-tab`,
      [HtmlAttributeName.Id]: `${node.props.id}-panel`,
      [HtmlAttributeName.Role]: "tabpanel",
    },
    children: slots.children,
    tag: HtmlTag.Div,
  }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Tab,
} satisfies NodeTypeDefinition<TabNode>;
