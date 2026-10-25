import type { ESTree } from "@oxlint/plugins";

import { FAKED_TIMER } from "#src/services/oxlint/testing/constants";

export const checkIsFakingBatchTimer = (options: ESTree.Expression | ESTree.SpreadElement | undefined): boolean => {
  if (options?.type !== "ObjectExpression") return true;
  const toFake = options.properties.find(
    (property): property is ESTree.ObjectProperty =>
      property.type === "Property" && property.key.type === "Identifier" && property.key.name === "toFake",
  );
  if (toFake?.value.type === "ArrayExpression")
    return toFake.value.elements.some((element) => element?.type === "Literal" && element.value === FAKED_TIMER);
  else return true;
};
