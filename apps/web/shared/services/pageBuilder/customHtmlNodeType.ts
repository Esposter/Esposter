import type { CustomHtmlNode } from "#shared/models/pageBuilder/CustomHtmlNode";
import type { CustomHtmlNodeProps } from "#shared/models/pageBuilder/CustomHtmlNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

const customHtmlFormSchema = z.strictObject({ html: z.string() });
const customHtmlPropsSchema = z.object({
  ...customHtmlFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<CustomHtmlNodeProps>>;

// Raw HTML a page author writes, cleaned again at publish whatever was stored
export const customHtmlNodeType = {
  css: "",
  formSchema: customHtmlFormSchema,
  isFocusable: false,
  propsSchema: customHtmlPropsSchema,
  render: (node) => ({
    attributes: { [HtmlAttributeName.Class]: "custom-html" },
    children: [{ html: sanitizeHtml(node.props.html) }],
    tag: HtmlTag.Div,
  }),
  slots: {},
  type: WebpageNodeType.CustomHtml,
} satisfies NodeTypeDefinition<CustomHtmlNode>;
