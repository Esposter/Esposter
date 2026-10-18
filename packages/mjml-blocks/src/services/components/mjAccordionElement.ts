import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjAccordionElement: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    border: "string",
    "font-family": "string",
    "icon-align": "enum(top,middle,bottom)",
    "icon-width": "unit(px,%)",
    "icon-height": "unit(px,%)",
    "icon-wrapped-url": "string",
    "icon-wrapped-alt": "string",
    "icon-unwrapped-url": "string",
    "icon-unwrapped-alt": "string",
    "icon-position": "enum(left,right)",
  },
  children: ["mj-accordion-title", "mj-accordion-text", "mj-raw"],
  contentKind: undefined,
  defaultAttributes: {},
  hasAlternativeText: false,
  type: "mj-accordion-element",
};
