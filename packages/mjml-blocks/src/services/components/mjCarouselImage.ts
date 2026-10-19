import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { MjmlCarouselImageProps } from "#src/models/MjmlCarouselImageProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the carousel image component, each in MJML's grammar
const carouselImageAttributes = {
  alt: "string",
  "border-radius": "string",
  href: "string",
  rel: "string",
  src: "string",
  target: "string",
  "tb-border": "string",
  "tb-border-radius": "string",
  "thumbnails-src": "string",
  title: "string",
};

// The carousel image component: the attributes it takes, the props its schema reads and what it renders
export const mjmlCarouselImageType: MjmlBlockTypeDefinition<MjmlCarouselImageNode> = {
  allowedAttributes: carouselImageAttributes,
  contentKind: undefined,
  defaultAttributes: { alt: "", target: "_blank" },
  hasAlternativeText: true,
  propsSchema: z
    .strictObject({ ...createMjmlAttributeShape(carouselImageAttributes), decorative: z.boolean().optional() })
    .superRefine(checkMjmlAlternativeText) satisfies z.ZodType<OwnProps<MjmlCarouselImageProps>>,
  render: renderMjmlNode({
    allowedAttributes: carouselImageAttributes,
    contentKind: undefined,
    hasAlternativeText: true,
    hasChildren: false,
    tagName: MjmlNodeType.CarouselImage,
  }),
  slots: {},
  type: MjmlNodeType.CarouselImage,
};
