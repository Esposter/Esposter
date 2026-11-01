import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";

// The attributes MJML takes on the accordion text component, each in MJML's grammar
const accordionTextBaseAttributes = {
  "background-color": "color",
  color: "color",
  "font-family": "string",
  "font-size": "unit(px)",
  "font-weight": "string",
  "letter-spacing": "unitWithNegative(px,em)",
  "line-height": "unit(px,%,)",
  padding: "unit(px,%){1,4}",
};

export const accordionTextAttributes: typeof accordionTextBaseAttributes & typeof MJML_PADDING_ATTRIBUTES = {
  ...accordionTextBaseAttributes,
  ...MJML_PADDING_ATTRIBUTES,
};
