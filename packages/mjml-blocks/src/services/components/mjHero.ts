import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlHeroProps } from "#src/models/MjmlHeroProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the hero component, each in MJML's grammar
export const heroAttributes = {
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

export const heroPropsSchema: z.ZodObject<{ [K in keyof typeof heroAttributes]: MjmlAttributeSchema }, z.core.$strict> =
  z.strictObject({
    "background-color": createMjmlAttributeSchema(heroAttributes["background-color"], "background-color").optional(),
    "background-height": createMjmlAttributeSchema(heroAttributes["background-height"], "background-height").optional(),
    "background-position": createMjmlAttributeSchema(
      heroAttributes["background-position"],
      "background-position",
    ).optional(),
    "background-url": createMjmlAttributeSchema(heroAttributes["background-url"], "background-url").optional(),
    "background-width": createMjmlAttributeSchema(heroAttributes["background-width"], "background-width").optional(),
    "border-radius": createMjmlAttributeSchema(heroAttributes["border-radius"], "border-radius").optional(),
    height: createMjmlAttributeSchema(heroAttributes.height, "height").optional(),
    "inner-background-color": createMjmlAttributeSchema(
      heroAttributes["inner-background-color"],
      "inner-background-color",
    ).optional(),
    "inner-padding": createMjmlAttributeSchema(heroAttributes["inner-padding"], "inner-padding").optional(),
    "inner-padding-bottom": createMjmlAttributeSchema(
      heroAttributes["inner-padding-bottom"],
      "inner-padding-bottom",
    ).optional(),
    "inner-padding-left": createMjmlAttributeSchema(
      heroAttributes["inner-padding-left"],
      "inner-padding-left",
    ).optional(),
    "inner-padding-right": createMjmlAttributeSchema(
      heroAttributes["inner-padding-right"],
      "inner-padding-right",
    ).optional(),
    "inner-padding-top": createMjmlAttributeSchema(heroAttributes["inner-padding-top"], "inner-padding-top").optional(),
    mode: createMjmlAttributeSchema(heroAttributes.mode, "mode").optional(),
    padding: createMjmlAttributeSchema(heroAttributes.padding, "padding").optional(),
    "padding-bottom": createMjmlAttributeSchema(heroAttributes["padding-bottom"], "padding-bottom").optional(),
    "padding-left": createMjmlAttributeSchema(heroAttributes["padding-left"], "padding-left").optional(),
    "padding-right": createMjmlAttributeSchema(heroAttributes["padding-right"], "padding-right").optional(),
    "padding-top": createMjmlAttributeSchema(heroAttributes["padding-top"], "padding-top").optional(),
    "vertical-align": createMjmlAttributeSchema(heroAttributes["vertical-align"], "vertical-align").optional(),
  }) satisfies z.ZodType<OwnProps<MjmlHeroProps>>;

// The hero component: the attributes it takes, the props its schema reads and what it renders
export const createMjmlHeroType = (leafTypes: MjmlLeafNode["type"][]): MjmlBlockTypeDefinition<MjmlHeroNode> => {
  const heroTypeFields = {
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
    propsSchema: heroPropsSchema,
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
  } satisfies Partial<MjmlBlockTypeDefinition<MjmlHeroNode>>;

  return {
    ...heroTypeFields,
    render: renderMjmlNode({ ...heroTypeFields, hasChildren: true, tagName: MjmlNodeType.Hero }),
  };
};
