import { SELECTORS_LONGEST_FIRST } from "#src/services/oxlint/sorting/classMemberGroups";

// A group's name is its modifiers and then its selector, so the selector is the longest one the name ends with.
// A name ending with none, like `unknown`, is not a predefined group.
export const parsePredefinedGroup = (name: string) => {
  const selector = SELECTORS_LONGEST_FIRST.find((candidate) => name === candidate || name.endsWith(`-${candidate}`));
  if (selector === undefined) return undefined;
  const modifiers = name === selector ? [] : name.slice(0, -selector.length - 1).split("-");
  return { modifiers, name, selector };
};
