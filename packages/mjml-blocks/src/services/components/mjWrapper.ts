import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

import { sectionAttributes } from "#src/services/components/sectionAttributes";

export const mjWrapper: MjmlComponentSpecification = {
  ...sectionAttributes,
  allowedAttributes: { ...sectionAttributes.allowedAttributes, gap: "unit(px)" },
  children: ["mj-hero", "mj-raw", "mj-section"],
  hasAlternativeText: false,
  type: "mj-wrapper",
};
