import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjSpacer: MjmlComponentSpecification = {
  allowedAttributes: {
    border: "string",
    "border-bottom": "string",
    "border-left": "string",
    "border-right": "string",
    "border-top": "string",
    "container-background-color": "color",
    height: "unit(px,%)",
    padding: "unit(px,%){1,4}",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
  },
  children: [],
  defaultAttributes: { height: "20px" },
  hasAlternativeText: false,
  type: "mj-spacer",
};
