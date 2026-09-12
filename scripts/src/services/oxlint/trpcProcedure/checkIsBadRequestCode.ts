import type { ESTree } from "@oxlint/plugins";

import { getPropertyValue } from "#src/services/oxlint/trpcProcedure/getPropertyValue";

export const checkIsBadRequestCode = (property: ESTree.Node): boolean => {
  const value = getPropertyValue(property, "code");
  return value?.type === "Literal" && value.value === "BAD_REQUEST";
};
