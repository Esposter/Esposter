import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { SectionNode } from "#shared/models/pageBuilder/SectionNode";
import type { SectionNodeProps } from "#shared/models/pageBuilder/SectionNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The semantic tags a section renders under
const sectionFormSchema = z.strictObject({
  tag: z.enum([HtmlTag.Div, HtmlTag.Footer, HtmlTag.Header, HtmlTag.Main, HtmlTag.Section]),
});
const sectionPropsSchema = z.object({
  ...sectionFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<SectionNodeProps>>;

// A block of the page under a semantic tag, holding any placeable content
export const sectionNodeType = {
  css: "",
  formSchema: sectionFormSchema,
  isFocusable: false,
  propsSchema: sectionPropsSchema,
  render: (node, slots) => ({
    attributes: { [HtmlAttributeName.Class]: "section" },
    children: slots.children,
    tag: node.props.tag,
  }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Section,
} satisfies NodeTypeDefinition<SectionNode>;
