import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

const buttonFormSchema = z.strictObject({ href: webpageUrlSchema, label: z.string().min(1) });
const buttonPropsSchema = z.strictObject({ ...buttonFormSchema.shape, id: z.string() });

// A link drawn as a button, so the published control is a real link a reader can follow and focus
export const buttonNodeType = {
  css: ".button { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.25rem; background-color: #333; color: #fff; text-decoration: none; }",
  formSchema: buttonFormSchema,
  propsSchema: buttonPropsSchema,
  render: (node) => {
    const { href, label } = buttonPropsSchema.parse(node.props);
    return { attributes: { class: "button", href }, children: [label], tag: "a" };
  },
  script: undefined,
  slots: {},
  type: WebpageNodeType.Button,
} satisfies NodeTypeDefinition;
