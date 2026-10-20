import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { MjmlCarouselImageProps } from "#src/models/MjmlCarouselImageProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the carousel image component, each in MJML's grammar
export const carouselImageAttributes = {
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

export const carouselImagePropsSchema: z.ZodObject<
  { [K in keyof typeof carouselImageAttributes]: MjmlAttributeSchema } & { decorative: z.ZodOptional<z.ZodBoolean> },
  z.core.$strict
> = z
  .strictObject({
    alt: createMjmlAttributeSchema(carouselImageAttributes.alt, "alt").optional(),
    "border-radius": createMjmlAttributeSchema(carouselImageAttributes["border-radius"], "border-radius").optional(),
    decorative: z.boolean().optional(),
    href: createMjmlAttributeSchema(carouselImageAttributes.href, "href").optional(),
    rel: createMjmlAttributeSchema(carouselImageAttributes.rel, "rel").optional(),
    src: createMjmlAttributeSchema(carouselImageAttributes.src, "src").optional(),
    target: createMjmlAttributeSchema(carouselImageAttributes.target, "target").optional(),
    "tb-border": createMjmlAttributeSchema(carouselImageAttributes["tb-border"], "tb-border").optional(),
    "tb-border-radius": createMjmlAttributeSchema(
      carouselImageAttributes["tb-border-radius"],
      "tb-border-radius",
    ).optional(),
    "thumbnails-src": createMjmlAttributeSchema(carouselImageAttributes["thumbnails-src"], "thumbnails-src").optional(),
    title: createMjmlAttributeSchema(carouselImageAttributes.title, "title").optional(),
  })
  .superRefine(checkMjmlAlternativeText) satisfies z.ZodType<OwnProps<MjmlCarouselImageProps>>;

// The carousel image component: the attributes it takes, the props its schema reads and what it renders
export const mjmlCarouselImageType: MjmlBlockTypeDefinition<MjmlCarouselImageNode> = {
  allowedAttributes: carouselImageAttributes,
  contentKind: undefined,
  defaultAttributes: { alt: "", target: "_blank" },
  hasAlternativeText: true,
  propsSchema: carouselImagePropsSchema,
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
