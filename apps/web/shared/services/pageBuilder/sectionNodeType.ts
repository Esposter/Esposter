import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { WEBPAGE_PLACEABLE_NODE_TYPES } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The semantic tags a section renders under
const sectionFormSchema = z.strictObject({
  tag: z.enum([HtmlTag.Div, HtmlTag.Footer, HtmlTag.Header, HtmlTag.Main, HtmlTag.Section]),
});
const sectionPropsSchema = z.strictObject({
  ...sectionFormSchema.shape,
  children: z.array(z.unknown()),
  id: z.string(),
});

// A block of the page under a semantic tag, holding any placeable content
export const sectionNodeType = {
  css: "",
  formSchema: sectionFormSchema,
  propsSchema: sectionPropsSchema,
  render: (node, slots) => ({
    attributes: { [HtmlAttributeName.Class]: "section" },
    children: slots.children ?? [],
    tag: sectionPropsSchema.parse(node.props).tag,
  }),
  slots: { children: WEBPAGE_PLACEABLE_NODE_TYPES },
  type: WebpageNodeType.Section,
} satisfies NodeTypeDefinition;
