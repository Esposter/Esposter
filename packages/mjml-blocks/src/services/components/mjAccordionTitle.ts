import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

import { MjmlContentKind } from "#src/models/MjmlContentKind";

export const mjAccordionTitle: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    color: "color",
    "font-family": "string",
    "font-size": "unit(px)",
    "font-weight": "string",
    padding: "unit(px,%){1,4}",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
  },
  children: [],
  contentKind: MjmlContentKind.Label,
  defaultAttributes: { "font-size": "13px", padding: "16px" },
  hasAlternativeText: false,
  type: "mj-accordion-title",
};
