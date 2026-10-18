import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";

import { MjmlContentKind } from "#src/models/MjmlContentKind";

export const mjRaw: MjmlComponentSpecification = {
  allowedAttributes: { position: "enum(file-start)" },
  children: [],
  contentKind: MjmlContentKind.Raw,
  defaultAttributes: {},
  hasAlternativeText: false,
  type: "mj-raw",
};
