import { MJML_PADDING_ATTRIBUTES } from "#src/services/constants";

// The attributes and defaults a section-shaped container shares, held once so mj-section and mj-wrapper cannot drift apart
const sectionBaseAllowedAttributes = {
  "background-color": "color",
  "background-position": "string",
  "background-position-x": "string",
  "background-position-y": "string",
  "background-repeat": "enum(repeat,no-repeat)",
  "background-size": "string",
  "background-url": "string",
  border: "string",
  "border-bottom": "string",
  "border-left": "string",
  "border-radius": "string",
  "border-right": "string",
  "border-top": "string",
  direction: "enum(ltr,rtl)",
  "full-width": "enum(full-width,false,)",
  gutter: "unit(px,%)",
  padding: "unit(px,%){1,4}",
  "text-align": "enum(left,center,right)",
  "text-padding": "unit(px,%){1,4}",
};
const sectionDefaultAttributes = {
  "background-position": "top center",
  "background-repeat": "repeat",
  "background-size": "auto",
  direction: "ltr",
  padding: "20px 0",
  "text-align": "center",
  "text-padding": "4px 4px 4px 0",
};

export const sectionAttributes: {
  allowedAttributes: typeof MJML_PADDING_ATTRIBUTES & typeof sectionBaseAllowedAttributes;
  defaultAttributes: typeof sectionDefaultAttributes;
} = {
  allowedAttributes: { ...sectionBaseAllowedAttributes, ...MJML_PADDING_ATTRIBUTES },
  defaultAttributes: sectionDefaultAttributes,
};
