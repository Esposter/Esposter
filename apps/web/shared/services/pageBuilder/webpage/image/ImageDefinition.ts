import type { WebpageNodeTypeDefinition } from "#shared/models/pageBuilder/webpage/WebpageNodeTypeDefinition";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { imagePropsSchema } from "#shared/models/pageBuilder/webpage/ImageProps";
import { WebpageNodeType } from "#shared/models/pageBuilder/webpage/WebpageNodeType";
import { createElement } from "#shared/services/pageBuilder/html/createElement";

export const ImageDefinition = {
  createProps: () => ({ alt: "", isDecorative: false, src: "", style: {} }),
  createPropsSchema: () => imagePropsSchema,
  render: ({ alt, isDecorative, src }) =>
    createElement(ElementTag.Image, {
      [ElementAttribute.Alt]: isDecorative ? "" : alt,
      [ElementAttribute.Loading]: "lazy",
      [ElementAttribute.Src]: src || undefined,
    }),
  slots: {},
  type: WebpageNodeType.Image,
} satisfies WebpageNodeTypeDefinition<WebpageNodeType.Image>;
