import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { z } from "zod";

const tooltipFormSchema = z.strictObject({ label: z.string().min(1), text: z.string().min(1) });
const tooltipPropsSchema = z.strictObject({ ...tooltipFormSchema.shape, id: z.string() });

// A button whose text shows on hover and on keyboard focus, described by that text for a reader who cannot see it
export const tooltipNodeType = {
  css: `.tooltip { position: relative; display: inline-block; }
.tooltip > [role="tooltip"] { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); white-space: nowrap; }
.tooltip:hover > [role="tooltip"], .tooltip:focus-within > [role="tooltip"] { display: block; }`,
  formSchema: tooltipFormSchema,
  propsSchema: tooltipPropsSchema,
  render: (node) => {
    const { id, label, text } = tooltipPropsSchema.parse(node.props);
    return {
      attributes: { class: "tooltip" },
      children: [
        { attributes: { "aria-describedby": `${id}-tip`, type: "button" }, children: [label], tag: "button" },
        { attributes: { id: `${id}-tip`, role: "tooltip" }, children: [text], tag: "span" },
      ],
      tag: "span",
    };
  },
  slots: {},
  type: WebpageNodeType.Tooltip,
} satisfies NodeTypeDefinition;
