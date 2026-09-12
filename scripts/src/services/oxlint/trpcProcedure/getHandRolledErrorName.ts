import type { ESTree } from "@oxlint/plugins";

import { getPropertyValue } from "#src/services/oxlint/trpcProcedure/getPropertyValue";

// The `message:` property of an object literal, when it reads `.message` off a `new SomeError(...)`.
export const getHandRolledErrorName = (property: ESTree.Node): string | undefined => {
  const value = getPropertyValue(property, "message");
  if (value?.type !== "MemberExpression" || value.computed) return undefined;
  if (value.property.type !== "Identifier" || value.property.name !== "message") return undefined;
  const { object } = value;
  if (object.type !== "NewExpression" || object.callee.type !== "Identifier") return undefined;
  return object.callee.name;
};
