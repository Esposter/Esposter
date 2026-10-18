import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

import { MjmlContentKind } from "#src/models/MjmlContentKind";

export const mjAccordionText: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    color: "color",
    "font-family": "string",
    "font-size": "unit(px)",
    "font-weight": "string",
    "letter-spacing": "unitWithNegative(px,em)",
    "line-height": "unit(px,%,)",
    padding: "unit(px,%){1,4}",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
  },
  children: [],
  contentKind: MjmlContentKind.RichText,
  defaultAttributes: { "font-size": "13px", "line-height": "1", padding: "16px" },
  hasAlternativeText: false,
  type: "mj-accordion-text",
};
