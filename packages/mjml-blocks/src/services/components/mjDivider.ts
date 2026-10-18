import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjDivider: MjmlComponentSpecification = {
  allowedAttributes: {
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
    align: "enum(left,center,right)",
  },
  children: [],
  contentKind: undefined,
  defaultAttributes: {
    "border-color": "#000000",
    "border-style": "solid",
    "border-width": "4px",
    padding: "10px 25px",
    width: "100%",
    align: "center",
  },
  hasAlternativeText: false,
  type: "mj-divider",
};
