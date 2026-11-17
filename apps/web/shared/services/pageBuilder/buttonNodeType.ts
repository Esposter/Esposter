import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { OwnProps } from "vue-block-editor-headless";

import { ButtonTarget, buttonTargetSchema } from "#shared/models/pageBuilder/ButtonTarget";
import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { elementIdSchema } from "#shared/services/pageBuilder/elementIdSchema";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

const buttonFormSchema = z.strictObject({
  elementId: elementIdSchema,
  href: webpageUrlSchema,
  label: nodeTextSchema,
  target: buttonTargetSchema,
});
const buttonPropsSchema = z.object({
  ...buttonFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<ButtonNodeProps>>;

// A link drawn as a button, so the published control is a real link a reader can follow and focus
export const buttonNodeType = {
  css: ".button { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; background-color: #333; color: #fff; text-decoration: none; }",
  formSchema: buttonFormSchema,
  isFocusable: true,
  propsSchema: buttonPropsSchema,
  render: (node) => {
    const isNewTab = node.props.target === ButtonTarget.NewTab;
    return {
      attributes: {
        [HtmlAttributeName.Class]: "button",
        [HtmlAttributeName.Href]: node.props.href,
        // A new-tab link always carries the relationship that keeps the new page from reaching back to this one
        ...(isNewTab ? { [HtmlAttributeName.Rel]: "noopener", [HtmlAttributeName.Target]: ButtonTarget.NewTab } : {}),
      },
      children: [node.props.label],
      tag: HtmlTag.A,
    };
  },
  slots: {},
  type: WebpageNodeType.Button,
} satisfies NodeTypeDefinition<ButtonNode>;
