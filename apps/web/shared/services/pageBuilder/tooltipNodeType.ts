import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { z } from "zod";

const tooltipFormSchema = z.strictObject({ label: z.string().min(1), text: z.string().min(1) });
const tooltipPropsSchema = z.object({ ...tooltipFormSchema.shape, style: nodeStyleSchema.optional() });

// A button whose text shows on hover and on keyboard focus, described by that text for a reader who cannot see it
export const tooltipNodeType = {
  css: `.tooltip { position: relative; display: inline-block; }
.tooltip > [role="tooltip"] { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.tooltip:hover > [role="tooltip"], .tooltip:focus-within > [role="tooltip"] { display: block; }`,
  formSchema: tooltipFormSchema,
  isFocusable: false,
  propsSchema: tooltipPropsSchema,
  render: (node) => {
    const id = z.string().parse(node.props.id);
    const { label, text } = tooltipPropsSchema.parse(node.props);
    return {
      attributes: { [HtmlAttributeName.Class]: "tooltip" },
      children: [
        {
          attributes: { [HtmlAttributeName.AriaDescribedBy]: `${id}-tip`, [HtmlAttributeName.Type]: "button" },
          children: [label],
          tag: HtmlTag.Button,
        },
        {
          attributes: { [HtmlAttributeName.Id]: `${id}-tip`, [HtmlAttributeName.Role]: "tooltip" },
          children: [text],
          tag: HtmlTag.Span,
        },
      ],
      tag: HtmlTag.Span,
    };
  },
  slots: {},
  type: WebpageNodeType.Tooltip,
} satisfies NodeTypeDefinition;
