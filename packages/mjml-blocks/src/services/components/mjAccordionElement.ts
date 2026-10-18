import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjAccordionElement: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    border: "string",
    "font-family": "string",
    "icon-align": "enum(top,middle,bottom)",
    "icon-height": "unit(px,%)",
    "icon-position": "enum(left,right)",
    "icon-unwrapped-alt": "string",
    "icon-unwrapped-url": "string",
    "icon-width": "unit(px,%)",
    "icon-wrapped-alt": "string",
    "icon-wrapped-url": "string",
  },
  children: ["mj-accordion-title", "mj-accordion-text", "mj-raw"],
  defaultAttributes: {},
  hasAlternativeText: false,
  type: "mj-accordion-element",
};
