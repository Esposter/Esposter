import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";
import type { ButtonNodeProps } from "#shared/models/pageBuilder/ButtonNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";
import type { OwnProps } from "headless-block-editor";

const buttonFormSchema = z.strictObject({ href: webpageUrlSchema, label: z.string().min(1) });
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
  render: (node) => ({
    attributes: { class: "button", href: node.props.href },
    children: [node.props.label],
    tag: HtmlTag.A,
  }),
  slots: {},
  type: WebpageNodeType.Button,
} satisfies NodeTypeDefinition<ButtonNode>;
