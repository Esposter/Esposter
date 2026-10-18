import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

import { sectionAttributes } from "#src/services/components/sectionAttributes";

export const mjSection: MjmlComponentSpecification = {
  ...sectionAttributes,
  children: ["mj-column", "mj-group", "mj-raw"],
  hasAlternativeText: false,
  type: "mj-section",
};
