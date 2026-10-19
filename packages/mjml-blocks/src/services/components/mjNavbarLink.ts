import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlNavbarLinkProps } from "#src/models/MjmlNavbarLinkProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the navbar link component, each in MJML's grammar
const navbarLinkAttributes = {
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
  propsSchema: z.strictObject({
    ...createMjmlAttributeShape(navbarLinkAttributes),
    content: z.string(),
  }) satisfies z.ZodType<OwnProps<MjmlNavbarLinkProps>>,
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
