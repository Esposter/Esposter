import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlNavbarProps } from "#src/models/MjmlNavbarProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the navbar component, each in MJML's grammar
const navbarAttributes = {
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
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
};

// The navbar component: the attributes it takes, the props its schema reads and what it renders
export const mjmlNavbarType: MjmlBlockTypeDefinition<MjmlNavbarNode> = {
  allowedAttributes: navbarAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "ico-align": "center",
    "ico-close": "&#8855;",
    "ico-color": "#000000",
    "ico-font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "ico-font-size": "30px",
    "ico-line-height": "30px",
    "ico-open": "&#9776;",
    "ico-padding": "10px",
    "ico-text-decoration": "none",
    "ico-text-transform": "uppercase",
  },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(navbarAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlNavbarProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: navbarAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Navbar,
  }),
  slots: { children: [MjmlNodeType.NavbarLink, MjmlNodeType.Raw] },
  type: MjmlNodeType.Navbar,
};
