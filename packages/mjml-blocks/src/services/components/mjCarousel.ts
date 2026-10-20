import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlCarouselNode } from "#src/models/MjmlCarouselNode";
import type { MjmlCarouselProps } from "#src/models/MjmlCarouselProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the carousel component, each in MJML's grammar
export const carouselAttributes = {
  align: "enum(left,center,right)",
  "border-radius": "string",
  "container-background-color": "color",
  "icon-width": "unit(px,%)",
  "left-icon": "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  "right-icon": "string",
  "tb-border": "string",
  "tb-border-radius": "string",
  "tb-hover-border-color": "color",
  "tb-selected-border-color": "color",
  "tb-width": "unit(px,%)",
  thumbnails: "enum(visible,hidden,supported)",
};

export const carouselPropsSchema: z.ZodObject<
  { [K in keyof typeof carouselAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(carouselAttributes.align, "align").optional(),
  "border-radius": createMjmlAttributeSchema(carouselAttributes["border-radius"], "border-radius").optional(),
  "container-background-color": createMjmlAttributeSchema(
    carouselAttributes["container-background-color"],
    "container-background-color",
  ).optional(),
  "icon-width": createMjmlAttributeSchema(carouselAttributes["icon-width"], "icon-width").optional(),
  "left-icon": createMjmlAttributeSchema(carouselAttributes["left-icon"], "left-icon").optional(),
  padding: createMjmlAttributeSchema(carouselAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(carouselAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(carouselAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(carouselAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(carouselAttributes["padding-top"], "padding-top").optional(),
  "right-icon": createMjmlAttributeSchema(carouselAttributes["right-icon"], "right-icon").optional(),
  "tb-border": createMjmlAttributeSchema(carouselAttributes["tb-border"], "tb-border").optional(),
  "tb-border-radius": createMjmlAttributeSchema(carouselAttributes["tb-border-radius"], "tb-border-radius").optional(),
  "tb-hover-border-color": createMjmlAttributeSchema(
    carouselAttributes["tb-hover-border-color"],
    "tb-hover-border-color",
  ).optional(),
  "tb-selected-border-color": createMjmlAttributeSchema(
    carouselAttributes["tb-selected-border-color"],
    "tb-selected-border-color",
  ).optional(),
  "tb-width": createMjmlAttributeSchema(carouselAttributes["tb-width"], "tb-width").optional(),
  thumbnails: createMjmlAttributeSchema(carouselAttributes.thumbnails, "thumbnails").optional(),
}) satisfies z.ZodType<OwnProps<MjmlCarouselProps>>;

// The carousel component: the attributes it takes, the props its schema reads and what it renders
const mjmlCarouselTypeFields = {
  allowedAttributes: carouselAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "border-radius": "6px",
    "icon-width": "44px",
    "left-icon": "https://i.imgur.com/xTh3hln.png",
    "right-icon": "https://i.imgur.com/os7o9kz.png",
    "tb-border": "2px solid transparent",
    "tb-border-radius": "6px",
    "tb-hover-border-color": "#fead0d",
    "tb-selected-border-color": "#ccc",
    thumbnails: "visible",
  },
  hasAlternativeText: false,
  propsSchema: carouselPropsSchema,
  slots: { children: [MjmlNodeType.CarouselImage] },
  type: MjmlNodeType.Carousel,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlCarouselNode>>;

export const mjmlCarouselType: MjmlBlockTypeDefinition<MjmlCarouselNode> = {
  ...mjmlCarouselTypeFields,
  render: renderMjmlNode({ ...mjmlCarouselTypeFields, hasChildren: true, tagName: MjmlNodeType.Carousel }),
};
