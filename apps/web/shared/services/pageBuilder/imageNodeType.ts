import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { ImageNodeProps } from "#shared/models/pageBuilder/ImageNodeProps";
import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { OwnProps } from "headless-block-editor";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { nodeStyleSchema } from "#shared/models/pageBuilder/NodeStyle";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { MAX_NODE_TEXT_LENGTH } from "#shared/services/pageBuilder/constants";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

// An image needs its alternative text or an explicit decorative flag, so a reader who cannot see it is never left without it
export const refineImageAlternative = (
  { alt, decorative }: { alt: string; decorative: boolean },
  context: z.RefinementCtx,
) => {
  if (!decorative && alt === "")
    context.addIssue({ code: "custom", message: "needs alternative text or a decorative flag", path: ["alt"] });
};

const imageShape = { alt: z.string().max(MAX_NODE_TEXT_LENGTH), decorative: z.boolean(), src: webpageUrlSchema };
const imageFormSchema = z.strictObject(imageShape).superRefine(refineImageAlternative);
const imagePropsSchema = z
  .object({ ...imageShape, style: nodeStyleSchema.optional() })
  .superRefine(refineImageAlternative) satisfies z.ZodType<OwnProps<ImageNodeProps>>;

export const imageNodeType = {
  css: ".image { max-width: 100%; height: auto; }",
  formSchema: imageFormSchema,
  isFocusable: false,
  propsSchema: imagePropsSchema,
  render: (node) => {
    const { alt, decorative, src } = node.props;
    return {
      attributes: {
        [HtmlAttributeName.Alt]: decorative ? "" : alt,
        [HtmlAttributeName.Class]: "image",
        ...(decorative ? { [HtmlAttributeName.Role]: "presentation" } : {}),
        [HtmlAttributeName.Src]: src,
      },
      children: [],
      tag: HtmlTag.Img,
    };
  },
  slots: {},
  type: WebpageNodeType.Image,
} satisfies NodeTypeDefinition<ImageNode>;
