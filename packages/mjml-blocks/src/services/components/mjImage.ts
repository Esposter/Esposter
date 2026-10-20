import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlImageProps } from "#src/models/MjmlImageProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the image component, each in MJML's grammar
export const imageAttributes = {
  align: "enum(left,center,right)",
  alt: "string",
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-radius": "string",
  "border-right": "string",
  "border-top": "string",
  "container-background-color": "color",
  "fluid-on-mobile": "boolean",
  "font-size": "unit(px)",
  height: "unit(px,auto)",
  href: "string",
  "max-height": "unit(px,%)",
  name: "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  rel: "string",
  sizes: "string",
  src: "string",
  srcset: "string",
  target: "string",
  title: "string",
  usemap: "string",
  width: "unit(px)",
};

export const imagePropsSchema: z.ZodObject<
  { [K in keyof typeof imageAttributes]: MjmlAttributeSchema } & { decorative: z.ZodOptional<z.ZodBoolean> },
  z.core.$strict
> = z
  .strictObject({
    align: createMjmlAttributeSchema(imageAttributes.align, "align").optional(),
    alt: createMjmlAttributeSchema(imageAttributes.alt, "alt").optional(),
    border: createMjmlAttributeSchema(imageAttributes.border, "border").optional(),
    "border-bottom": createMjmlAttributeSchema(imageAttributes["border-bottom"], "border-bottom").optional(),
    "border-left": createMjmlAttributeSchema(imageAttributes["border-left"], "border-left").optional(),
    "border-radius": createMjmlAttributeSchema(imageAttributes["border-radius"], "border-radius").optional(),
    "border-right": createMjmlAttributeSchema(imageAttributes["border-right"], "border-right").optional(),
    "border-top": createMjmlAttributeSchema(imageAttributes["border-top"], "border-top").optional(),
    "container-background-color": createMjmlAttributeSchema(
      imageAttributes["container-background-color"],
      "container-background-color",
    ).optional(),
    decorative: z.boolean().optional(),
    "fluid-on-mobile": createMjmlAttributeSchema(imageAttributes["fluid-on-mobile"], "fluid-on-mobile").optional(),
    "font-size": createMjmlAttributeSchema(imageAttributes["font-size"], "font-size").optional(),
    height: createMjmlAttributeSchema(imageAttributes.height, "height").optional(),
    href: createMjmlAttributeSchema(imageAttributes.href, "href").optional(),
    "max-height": createMjmlAttributeSchema(imageAttributes["max-height"], "max-height").optional(),
    name: createMjmlAttributeSchema(imageAttributes.name, "name").optional(),
    padding: createMjmlAttributeSchema(imageAttributes.padding, "padding").optional(),
    "padding-bottom": createMjmlAttributeSchema(imageAttributes["padding-bottom"], "padding-bottom").optional(),
    "padding-left": createMjmlAttributeSchema(imageAttributes["padding-left"], "padding-left").optional(),
    "padding-right": createMjmlAttributeSchema(imageAttributes["padding-right"], "padding-right").optional(),
    "padding-top": createMjmlAttributeSchema(imageAttributes["padding-top"], "padding-top").optional(),
    rel: createMjmlAttributeSchema(imageAttributes.rel, "rel").optional(),
    sizes: createMjmlAttributeSchema(imageAttributes.sizes, "sizes").optional(),
    src: createMjmlAttributeSchema(imageAttributes.src, "src").optional(),
    srcset: createMjmlAttributeSchema(imageAttributes.srcset, "srcset").optional(),
    target: createMjmlAttributeSchema(imageAttributes.target, "target").optional(),
    title: createMjmlAttributeSchema(imageAttributes.title, "title").optional(),
    usemap: createMjmlAttributeSchema(imageAttributes.usemap, "usemap").optional(),
    width: createMjmlAttributeSchema(imageAttributes.width, "width").optional(),
  })
  .superRefine(checkMjmlAlternativeText) satisfies z.ZodType<OwnProps<MjmlImageProps>>;

// The image component: the attributes it takes, the props its schema reads and what it renders
const mjmlImageTypeFields = {
  allowedAttributes: imageAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    alt: "",
    border: "0",
    "font-size": "13px",
    height: "auto",
    padding: "10px 25px",
    target: "_blank",
  },
  hasAlternativeText: true,
  propsSchema: imagePropsSchema,
  slots: {},
  type: MjmlNodeType.Image,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlImageNode>>;

export const mjmlImageType: MjmlBlockTypeDefinition<MjmlImageNode> = {
  ...mjmlImageTypeFields,
  render: renderMjmlNode({ ...mjmlImageTypeFields, hasChildren: false, tagName: MjmlNodeType.Image }),
};
