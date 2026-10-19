import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

const customHtmlFormSchema = z.strictObject({ html: z.string() });
const customHtmlPropsSchema = z.object({ ...customHtmlFormSchema.shape, style: nodeStyleSchema.optional() });

// Raw HTML a page author writes, cleaned again at publish whatever was stored
export const customHtmlNodeType = {
  css: "",
  formSchema: customHtmlFormSchema,
  isFocusable: false,
  propsSchema: customHtmlPropsSchema,
  render: (node) => {
    const { html } = customHtmlPropsSchema.parse(node.props);
    return {
      attributes: { [HtmlAttributeName.Class]: "custom-html" },
      children: [{ html: sanitizeHtml(html) }],
      tag: HtmlTag.Div,
    };
  },
  slots: {},
  type: WebpageNodeType.CustomHtml,
} satisfies NodeTypeDefinition;
