import type { ESTree, Variable } from "@oxlint/plugins";

// A destructured prop the script never reads. A default and an alias keep their binding whatever the script does.
// A default is how the destructure gives the prop its value, and an alias renames it on purpose.
// A rest element is not a prop, and a computed or nested key names none.
// A read is any reference other than the declaration's own write: the scope manager resolves those across nested
// Functions, computeds and other bindings' defaults.
export const checkIsUnreadProperty = (
  property: ESTree.BindingProperty | ESTree.BindingRestElement,
  variables: Variable[],
): property is ESTree.BindingProperty & { value: ESTree.BindingIdentifier } => {
  if (property.type !== "Property" || property.computed) return false;
  if (property.value.type !== "Identifier" || property.key.type !== "Identifier") return false;
  if (property.key.name !== property.value.name) return false;
  const { name } = property.value;
  const variable = variables.find((candidate) => candidate.name === name);
  return variable?.references.every((reference) => reference.init) ?? false;
};
