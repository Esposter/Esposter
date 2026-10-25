import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlCarouselNode } from "#src/models/MjmlCarouselNode";
import type { MjmlCarouselProps } from "#src/models/MjmlCarouselProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the carousel component, each in MJML's grammar
const carouselBaseAttributes = {
  align: "enum(left,center,right)",
  "border-radius": "string",
  "container-background-color": "color",
  "icon-width": "unit(px,%)",
  "left-icon": "string",
  padding: "unit(px,%){1,4}",
  "right-icon": "string",
  "tb-border": "string",
  "tb-border-radius": "string",
  "tb-hover-border-color": "color",
  "tb-selected-border-color": "color",
  "tb-width": "unit(px,%)",
  thumbnails: "enum(visible,hidden,supported)",
};

export const carouselAttributes: typeof carouselBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...carouselBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const carouselPropsSchema: z.ZodObject<
  { [K in keyof typeof carouselAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({ ...createMjmlAttributeShape(carouselAttributes) }) satisfies z.ZodType<
  OwnProps<MjmlCarouselProps>
>;

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
  formSchema: z.strictObject({}),
  hasAlternativeText: false,
  propsSchema: carouselPropsSchema,
  slots: { children: [MjmlNodeType.CarouselImage] },
  type: MjmlNodeType.Carousel,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlCarouselNode>>;

export const mjmlCarouselType: MjmlBlockTypeDefinition<MjmlCarouselNode> = {
  ...mjmlCarouselTypeFields,
  render: renderMjmlNode({ ...mjmlCarouselTypeFields, hasChildren: true, tagName: MjmlNodeType.Carousel }),
};
