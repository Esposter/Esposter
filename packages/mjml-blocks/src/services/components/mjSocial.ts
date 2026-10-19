import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSocialProps } from "#src/models/MjmlSocialProps";
import type { OwnProps } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { createMjmlAttributeShape } from "#src/services/createMjmlAttributeShape";
import { renderMjmlNode } from "#src/services/renderMjmlNode";
import { z } from "zod";

// The attributes MJML takes on the social component, each in MJML's grammar
const socialAttributes = {
  align: "enum(left,right,center)",
  border: "string",
  "border-radius": "string",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  "icon-height": "unit(px,%)",
  "icon-padding": "unit(px,%){1,4}",
  "icon-size": "unit(px,%)",
  "inner-padding": "unit(px,%){1,4}",
  "line-height": "unit(px,%,)",
  mode: "enum(horizontal,vertical)",
  padding: "unit(px,%){1,4}",
  "padding-bottom": "unit(px,%)",
  "padding-left": "unit(px,%)",
  "padding-right": "unit(px,%)",
  "padding-top": "unit(px,%)",
  "table-layout": "enum(auto,fixed)",
  "text-decoration": "string",
  "text-padding": "unit(px,%){1,4}",
  "vertical-align": "enum(top,bottom,middle)",
};

// The social component: the attributes it takes, the props its schema reads and what it renders
export const mjmlSocialType: MjmlBlockTypeDefinition<MjmlSocialNode> = {
  allowedAttributes: socialAttributes,
  contentKind: undefined,
  defaultAttributes: {
    align: "center",
    "border-radius": "3px",
    color: "#333333",
    "font-family": "Ubuntu, Helvetica, Arial, sans-serif",
    "font-size": "13px",
    "icon-size": "20px",
    "line-height": "22px",
    mode: "horizontal",
    padding: "10px 25px",
    "text-decoration": "none",
  },
  hasAlternativeText: false,
  propsSchema: z.strictObject({ ...createMjmlAttributeShape(socialAttributes) }) satisfies z.ZodType<
    OwnProps<MjmlSocialProps>
  >,
  render: renderMjmlNode({
    allowedAttributes: socialAttributes,
    contentKind: undefined,
    hasAlternativeText: false,
    hasChildren: true,
    tagName: MjmlNodeType.Social,
  }),
  slots: { children: [MjmlNodeType.SocialElement, MjmlNodeType.Raw] },
  type: MjmlNodeType.Social,
};
