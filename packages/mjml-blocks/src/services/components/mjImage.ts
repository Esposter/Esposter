import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlImageProps } from "#src/models/MjmlImageProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { checkMjmlAlternativeText } from "#src/services/checkMjmlAlternativeText";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the image component, each in MJML's grammar
const imageAttributes = {
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

// The image component: the attributes it takes, the props its schema reads and what it renders
export const mjmlImageType: MjmlBlockTypeDefinition<MjmlImageNode> = {
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
  propsSchema: z
    .strictObject({ ...createMjmlAttributeShape(imageAttributes), decorative: z.boolean().optional() })
    .superRefine(checkMjmlAlternativeText) satisfies z.ZodType<OwnProps<MjmlImageProps>>,
  render: renderMjmlNode({
    allowedAttributes: imageAttributes,
    contentKind: undefined,
    hasAlternativeText: true,
    hasChildren: false,
    tagName: MjmlNodeType.Image,
  }),
  slots: {},
  type: MjmlNodeType.Image,
};
