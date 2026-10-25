import type { MjmlAttributeSchema } from "#src/models/MjmlAttributeSchema";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlHeroProps } from "#src/models/MjmlHeroProps";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the hero component, each in MJML's grammar
const heroBaseAttributes = {
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
  "vertical-align": "enum(top,bottom,middle)",
};

export const heroAttributes: typeof heroBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...heroBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};

export const heroPropsSchema: z.ZodObject<{ [K in keyof typeof heroAttributes]: MjmlAttributeSchema }, z.core.$strict> =
  z.strictObject({ ...createMjmlAttributeShape(heroAttributes) }) satisfies z.ZodType<OwnProps<MjmlHeroProps>>;

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
    formSchema: z.strictObject({}),
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
