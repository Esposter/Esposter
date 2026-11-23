import { CLASS_MEMBER_GROUPS } from "#src/services/oxlint/sorting/classMemberGroups";

// Every selector a class member can carry, most specific first, as perfectionist ranks them.
// A function property also carries `property`, and a constructor also carries `method`.
const SELECTORS = [
  "function-property",
  "accessor-property",
  "property",
  "constructor",
  "get-method",
  "set-method",
  "method",
  "index-signature",
  "static-block",
];
// Longest first, so `get-method` is read as a selector before `method` is, and `function-property` before `property`
const SELECTORS_LONGEST_FIRST = SELECTORS.toSorted((left, right) => right.length - left.length);

// A group's name is its modifiers and then its selector, so the selector is the longest one the name ends with.
// A name ending with none, like `unknown`, is not a predefined group.
const parsePredefinedGroup = (name: string) => {
  const selector = SELECTORS_LONGEST_FIRST.find((candidate) => name === candidate || name.endsWith(`-${candidate}`));
  if (selector === undefined) return undefined;
  const modifiers = name === selector ? [] : name.slice(0, -selector.length - 1).split("-");
  return { modifiers, name, selector };
};

// The predefined groups in the order a member is matched against them: the most specific selector first.
// Then the group naming the most modifiers, since the default groups never tie on both.
const PREDEFINED_GROUPS = CLASS_MEMBER_GROUPS.flat()
  .flatMap((name) => {
    const predefinedGroup = parsePredefinedGroup(name);
    return predefinedGroup ? [predefinedGroup] : [];
  })
  .toSorted(
    (left, right) =>
      SELECTORS.indexOf(left.selector) - SELECTORS.indexOf(right.selector) ||
      right.modifiers.length - left.modifiers.length,
  );

// A member's group is the first predefined group whose selector it carries and whose modifiers it all has
export const computeClassMemberGroup = (selectors: string[], modifiers: string[]): string =>
  PREDEFINED_GROUPS.find(
    (predefinedGroup) =>
      selectors.includes(predefinedGroup.selector) &&
      predefinedGroup.modifiers.every((modifier) => modifiers.includes(modifier)),
  )?.name ?? "unknown";
