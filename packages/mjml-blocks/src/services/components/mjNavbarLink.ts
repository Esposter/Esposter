import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlNavbarLinkProps } from "#src/models/MjmlNavbarLinkProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the navbar link component, each in MJML's grammar
export const navbarLinkAttributes = {
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  href: "string",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  name: "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  rel: "string",
  target: "string",
  "text-decoration": "string",
  "text-transform": "string",
};

export const navbarLinkPropsSchema: z.ZodObject<
  { [K in keyof typeof navbarLinkAttributes]: MjmlAttributeSchema } & { content: z.ZodString },
  z.core.$strict
> = z.strictObject({
  color: createMjmlAttributeSchema(navbarLinkAttributes.color, "color").optional(),
  content: z.string(),
  "font-family": createMjmlAttributeSchema(navbarLinkAttributes["font-family"], "font-family").optional(),
  "font-size": createMjmlAttributeSchema(navbarLinkAttributes["font-size"], "font-size").optional(),
  "font-style": createMjmlAttributeSchema(navbarLinkAttributes["font-style"], "font-style").optional(),
  "font-weight": createMjmlAttributeSchema(navbarLinkAttributes["font-weight"], "font-weight").optional(),
  href: createMjmlAttributeSchema(navbarLinkAttributes.href, "href").optional(),
  "letter-spacing": createMjmlAttributeSchema(navbarLinkAttributes["letter-spacing"], "letter-spacing").optional(),
  "line-height": createMjmlAttributeSchema(navbarLinkAttributes["line-height"], "line-height").optional(),
  name: createMjmlAttributeSchema(navbarLinkAttributes.name, "name").optional(),
  padding: createMjmlAttributeSchema(navbarLinkAttributes.padding, "padding").optional(),
  "padding-bottom": createMjmlAttributeSchema(navbarLinkAttributes["padding-bottom"], "padding-bottom").optional(),
  "padding-left": createMjmlAttributeSchema(navbarLinkAttributes["padding-left"], "padding-left").optional(),
  "padding-right": createMjmlAttributeSchema(navbarLinkAttributes["padding-right"], "padding-right").optional(),
  "padding-top": createMjmlAttributeSchema(navbarLinkAttributes["padding-top"], "padding-top").optional(),
  rel: createMjmlAttributeSchema(navbarLinkAttributes.rel, "rel").optional(),
  target: createMjmlAttributeSchema(navbarLinkAttributes.target, "target").optional(),
  "text-decoration": createMjmlAttributeSchema(navbarLinkAttributes["text-decoration"], "text-decoration").optional(),
  "text-transform": createMjmlAttributeSchema(navbarLinkAttributes["text-transform"], "text-transform").optional(),
}) satisfies z.ZodType<OwnProps<MjmlNavbarLinkProps>>;

// The navbar link component: the attributes it takes, the props its schema reads and what it renders
export const mjmlNavbarLinkType: MjmlBlockTypeDefinition<MjmlNavbarLinkNode> = {
  allowedAttributes: navbarLinkAttributes,
  contentKind: MjmlContentKind.Label,
  defaultAttributes: {
    color: "#000000",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "font-weight": "normal",
    "line-height": "22px",
    padding: "15px 10px",
    target: "_blank",
    "text-decoration": "none",
    "text-transform": "uppercase",
  },
  hasAlternativeText: false,
  propsSchema: navbarLinkPropsSchema,
  render: renderMjmlNode({
    allowedAttributes: navbarLinkAttributes,
    contentKind: MjmlContentKind.Label,
    hasAlternativeText: false,
    hasChildren: false,
    tagName: MjmlNodeType.NavbarLink,
  }),
  slots: {},
  type: MjmlNodeType.NavbarLink,
};
