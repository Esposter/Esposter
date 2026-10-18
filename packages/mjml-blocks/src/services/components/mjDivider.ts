import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjDivider: MjmlComponentSpecification = {
  allowedAttributes: {
    align: "enum(left,center,right)",
    "border-color": "color",
    "border-style": "string",
    "border-width": "unit(px)",
    "container-background-color": "color",
    padding: "unit(px,%){1,4}",
    "padding-bottom": "unit(px,%)",
    "padding-left": "unit(px,%)",
    "padding-right": "unit(px,%)",
    "padding-top": "unit(px,%)",
    width: "unit(px,%)",
  },
  children: [],
  defaultAttributes: {
    align: "center",
    "border-color": "#000000",
    "border-style": "solid",
    "border-width": "4px",
    padding: "10px 25px",
    width: "100%",
  },
  hasAlternativeText: false,
  type: "mj-divider",
};
