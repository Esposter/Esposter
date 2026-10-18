import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

export const mjGroup: MjmlComponentSpecification = {
  allowedAttributes: {
    "background-color": "color",
    direction: "enum(ltr,rtl)",
    "vertical-align": "enum(top,bottom,middle)",
    width: "unit(px,%)",
  },
  children: ["mj-column", "mj-raw"],
  contentKind: undefined,
  defaultAttributes: { direction: "ltr" },
  hasAlternativeText: false,
  type: "mj-group",
};
