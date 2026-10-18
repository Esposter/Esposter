import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

const customHtmlFormSchema = z.strictObject({ html: z.string() });
const customHtmlPropsSchema = z.strictObject({ ...customHtmlFormSchema.shape, id: z.string() });

// Raw HTML a page author writes, cleaned again at publish whatever was stored
export const customHtmlNodeType = {
  css: "",
  formSchema: customHtmlFormSchema,
  propsSchema: customHtmlPropsSchema,
  render: (node) => {
    const { html } = customHtmlPropsSchema.parse(node.props);
    return { attributes: { class: "custom-html" }, children: [{ html: sanitizeHtml(html) }], tag: "div" };
  },
  script: undefined,
  slots: {},
  type: WebpageNodeType.CustomHtml,
} satisfies NodeTypeDefinition;
