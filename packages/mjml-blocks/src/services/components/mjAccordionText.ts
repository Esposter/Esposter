import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";
import { MjmlContentKind } from "#src/models/MjmlContentKind";

export const mjAccordionText: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    "font-size": "unit(px)",
    "font-family": "string",
    "font-weight": "string",
    "letter-spacing": "unitWithNegative(px,em)",
    "line-height": "unit(px,%,)",
    color: "color",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
    padding: "unit(px,%){1,4}",
  },
  children: [],
  contentKind: MjmlContentKind.RichText,
  defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
  hasAlternativeText: false,
  type: "mj-accordion-text",
};
