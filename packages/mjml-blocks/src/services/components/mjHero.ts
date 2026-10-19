import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlHeroProps } from "#src/models/MjmlHeroProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the hero component, each in MJML's grammar
const heroAttributes = {
  "background-color": "color",
  "background-height": "unit(px,%)",
  "background-position": "string",
  "background-url": "string",
  "background-width": "unit(px,%)",
  "border-radius": "string",
  height: "unit(px,%)",
  "inner-background-color": "color",
  "inner-padding": "unit(px,%){1,4}",
  "inner-padding-bottom": "unit(px,%)",
  "inner-padding-left": "unit(px,%)",
  "inner-padding-right": "unit(px,%)",
  "inner-padding-top": "unit(px,%)",
  mode: "string",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  "vertical-align": "enum(top,bottom,middle)",
};

// The hero component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlHeroType = (leafTypes: MjmlLeafNode["type"][]): MjmlBlockTypeDefinition<MjmlHeroNode> => ({
  allowedAttributes: heroAttributes,
  contentKind: undefined,
  defaultAttributes: {
    "background-color": "#ffffff",
    "background-position": "center center",
    height: "0px",
    mode: "fixed-height",
    padding: "0px",
    "vertical-align": "top",
  },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(heroAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlHeroProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: heroAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Hero,
  }),
  slots: {
    children: [
      MjmlNodeType.Accordion,
      MjmlNodeType.Button,
      MjmlNodeType.Carousel,
      MjmlNodeType.Divider,
      MjmlNodeType.Image,
      MjmlNodeType.Social,
      MjmlNodeType.Spacer,
      MjmlNodeType.Table,
      MjmlNodeType.Text,
      MjmlNodeType.Navbar,
      MjmlNodeType.Raw,
      ...leafTypes,
    ],
  },
  type: MjmlNodeType.Hero,
});
