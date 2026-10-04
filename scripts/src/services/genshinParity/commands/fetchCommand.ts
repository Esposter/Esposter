import type { SubCommandsDef } from "citty";

import { fetchReferences } from "#src/services/genshinParity/shared/fetchReferences";
import { defineCommand } from "citty";

export const fetchCommand: SubCommandsDef[string] = defineCommand({
  meta: { description: "Every reference not yet held, as PNG", name: "fetch" },
  run: () => fetchReferences(),
});
