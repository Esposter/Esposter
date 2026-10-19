import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";

import { HtmlAttributeName } from "#shared/models/pageBuilder/HtmlAttributeName";
import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { webpageUrlSchema } from "#shared/services/pageBuilder/webpageUrlSchema";
import { z } from "zod";

// An image needs its alternative text or an explicit decorative flag, so a reader who cannot see it is never left without it
const refineImageAlternative = (
  { alt, decorative }: { alt: string; decorative: boolean },
  context: z.RefinementCtx,
) => {
  if (!decorative && alt === "")
    context.addIssue({ code: "custom", message: "needs alternative text or a decorative flag", path: ["alt"] });
};

const imageShape = { alt: z.string(), decorative: z.boolean(), src: webpageUrlSchema };
const imageFormSchema = z.strictObject(imageShape).superRefine(refineImageAlternative);
const imagePropsSchema = z.strictObject({ ...imageShape, id: z.string() }).superRefine(refineImageAlternative);

export const imageNodeType = {
  css: ".image { max-width: 100%; height: auto; }",
  formSchema: imageFormSchema,
  propsSchema: imagePropsSchema,
  render: (node) => {
    const { alt, decorative, src } = imagePropsSchema.parse(node.props);
    return {
      attributes: decorative
        ? {
            [HtmlAttributeName.Alt]: "",
            [HtmlAttributeName.Class]: "image",
            [HtmlAttributeName.Role]: "presentation",
            [HtmlAttributeName.Src]: src,
          }
        : { [HtmlAttributeName.Alt]: alt, [HtmlAttributeName.Class]: "image", [HtmlAttributeName.Src]: src },
      children: [],
      tag: HtmlTag.Img,
    };
  },
  slots: {},
  type: WebpageNodeType.Image,
} satisfies NodeTypeDefinition;
