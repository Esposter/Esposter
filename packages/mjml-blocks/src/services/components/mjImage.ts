import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlImageProps } from "#src/models/MjmlImageProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the image component, each in MJML's grammar
const imageBaseAttributes = {
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
  rel: "string",
  sizes: "string",
  src: "string",
  srcset: "string",
  target: "string",
  title: "string",
  usemap: "string",
  width: "unit(px)",
};

export const imageAttributes: typeof imageBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...imageBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const imagePropsSchema: z.ZodObject<
  { [K in keyof typeof imageAttributes]: MjmlAttributeSchema } & { decorative: z.ZodOptional<z.ZodBoolean> },
  z.core.$strict
> = z
  .strictObject({ ...createMjmlAttributeShape(imageAttributes), decorative: z.boolean().optional() })
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
