import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";

// The attributes MJML takes on the text component, each in MJML's grammar
const textBaseAttributes = {
  align: "enum(left,right,center,justify)",
  "background-color": "color",
  color: "color",
  "container-background-color": "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-style": "string",
  "font-weight": "string",
  height: "unit(px,%)",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
  "text-decoration": "string",
  "text-transform": "string",
  "vertical-align": "enum(top,bottom,middle)",
};

export const textAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof textBaseAttributes = {
  ...textBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};
