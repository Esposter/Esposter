import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { TooltipNode } from "#shared/models/pageBuilder/TooltipNode";
import type { TooltipNodeProps } from "#shared/models/pageBuilder/TooltipNodeProps";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { nodeTextSchema } from "#shared/services/pageBuilder/nodeTextSchema";
import { z } from "zod";

const tooltipFormSchema = z.strictObject({ label: nodeTextSchema, text: nodeTextSchema });
const tooltipPropsSchema = z.object({
  ...tooltipFormSchema.shape,
  style: nodeStyleSchema.optional(),
}) satisfies z.ZodType<OwnProps<TooltipNodeProps>>;

// A button whose text shows on hover and on keyboard focus, described by that text for a reader who cannot see it
export const tooltipNodeType = {
  css: `.tooltip { position: relative; display: inline-block; }
.tooltip > [role="tooltip"] { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.tooltip:hover > [role="tooltip"], .tooltip:focus-within > [role="tooltip"] { display: block; }`,
  formSchema: tooltipFormSchema,
  isFocusable: false,
  propsSchema: tooltipPropsSchema,
  render: (node) => ({
    attributes: { [HtmlAttributeName.Class]: "tooltip" },
    children: [
      {
        attributes: { [HtmlAttributeName.AriaDescribedBy]: `${node.props.id}-tip`, [HtmlAttributeName.Type]: "button" },
        children: [node.props.label],
        tag: HtmlTag.Button,
      },
      {
        attributes: { [HtmlAttributeName.Id]: `${node.props.id}-tip`, [HtmlAttributeName.Role]: "tooltip" },
        children: [node.props.text],
        tag: HtmlTag.Span,
      },
    ],
    tag: HtmlTag.Span,
  }),
  slots: {},
  type: WebpageNodeType.Tooltip,
} satisfies NodeTypeDefinition<TooltipNode>;
