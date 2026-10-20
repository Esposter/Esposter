import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlNavbarProps } from "#src/models/MjmlNavbarProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the navbar component, each in MJML's grammar
const navbarBaseAttributes = {
  align: "enum(left,center,right)",
  "base-url": "string",
  hamburger: "string",
  "ico-align": "enum(left,center,right)",
  "ico-close": "string",
  "ico-color": "color",
  "ico-font-family": "string",
  "ico-font-size": "unit(px,%)",
  "ico-line-height": "unit(px,%,)",
  "ico-open": "string",
  "ico-padding": "unit(px,%){1,4}",
  "ico-padding-bottom": "unit(px,%)",
  "ico-padding-left": "unit(px,%)",
  "ico-padding-right": "unit(px,%)",
  "ico-padding-top": "unit(px,%)",
  "ico-text-decoration": "string",
  "ico-text-transform": "string",
  padding: "unit(px,%){1,4}",
};

export const navbarAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof navbarBaseAttributes = {
  ...navbarBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const navbarPropsSchema: z.ZodObject<
  { [K in keyof typeof navbarAttributes]: MjmlAttributeSchema },
  z.core.$strict
> = z.strictObject({
  align: createMjmlAttributeSchema(navbarAttributes.align, "align").optional(),
  "base-url": createMjmlAttributeSchema(navbarAttributes["base-url"], "base-url").optional(),
  hamburger: createMjmlAttributeSchema(navbarAttributes.hamburger, "hamburger").optional(),
  "ico-align": createMjmlAttributeSchema(navbarAttributes["ico-align"], "ico-align").optional(),
  "ico-close": createMjmlAttributeSchema(navbarAttributes["ico-close"], "ico-close").optional(),
  "ico-color": createMjmlAttributeSchema(navbarAttributes["ico-color"], "ico-color").optional(),
  "ico-font-family": createMjmlAttributeSchema(navbarAttributes["ico-font-family"], "ico-font-family").optional(),
  "ico-font-size": createMjmlAttributeSchema(navbarAttributes["ico-font-size"], "ico-font-size").optional(),
  "ico-line-height": createMjmlAttributeSchema(navbarAttributes["ico-line-height"], "ico-line-height").optional(),
  "ico-open": createMjmlAttributeSchema(navbarAttributes["ico-open"], "ico-open").optional(),
  "ico-padding": createMjmlAttributeSchema(navbarAttributes["ico-padding"], "ico-padding").optional(),
  "ico-padding-bottom": createMjmlAttributeSchema(
    navbarAttributes["ico-padding-bottom"],
    "ico-padding-bottom",
  ).optional(),
  "ico-padding-left": createMjmlAttributeSchema(navbarAttributes["ico-padding-left"], "ico-padding-left").optional(),
  "ico-padding-right": createMjmlAttributeSchema(navbarAttributes["ico-padding-right"], "ico-padding-right").optional(),
  "ico-padding-top": createMjmlAttributeSchema(navbarAttributes["ico-padding-top"], "ico-padding-top").optional(),
  "ico-text-decoration": createMjmlAttributeSchema(
    navbarAttributes["ico-text-decoration"],
    "ico-text-decoration",
  ).optional(),
  "ico-text-transform": createMjmlAttributeSchema(
    navbarAttributes["ico-text-transform"],
    "ico-text-transform",
  ).optional(),
  padding: createMjmlAttributeSchema(navbarAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(navbarAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(navbarAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(navbarAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(navbarAttributes["padding-top"], "padding-top").optional(),
}) satisfies z.ZodType<OwnProps<MjmlNavbarProps>>;

// The navbar component: the attributes it takes, the props its schema reads and what it renders
const mjmlNavbarTypeFields = {
  allowedAttributes: navbarAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "ico-align": "center",
    "ico-close": "⊗",
    "ico-color": "#000000",
    "ico-font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "ico-font-size": "30px",
    "ico-line-height": "30px",
    "ico-open": "☰",
    "ico-padding": "10px",
    "ico-text-decoration": "none",
    "ico-text-transform": "uppercase",
  },
  hasAlternativeText: false,
  propsSchema: navbarPropsSchema,
  slots: { children: [MjmlNodeType.NavbarLink, MjmlNodeType.Raw] },
  type: MjmlNodeType.Navbar,
} satisfies Partial<MjmlBlockTypeDefinition<MjmlNavbarNode>>;

export const mjmlNavbarType: MjmlBlockTypeDefinition<MjmlNavbarNode> = {
  ...mjmlNavbarTypeFields,
  render: renderMjmlNode({ ...mjmlNavbarTypeFields, hasChildren: true, tagName: MjmlNodeType.Navbar }),
};
