// A group's name is its modifiers and then its selector, so the selector is the longest one the name ends with.
// A name ending with none, like `unknown`, is not a predefined group. The caller passes the selectors longest first.
export const parsePredefinedGroup = (name: string, selectorsLongestFirst: string[]) => {
  const selector = selectorsLongestFirst.find((candidate) => name === candidate || name.endsWith(`-${candidate}`));
  if (selector === undefined) return undefined;
  const modifiers = name === selector ? [] : name.slice(0, -selector.length - 1).split("-");
  return { modifiers, name, selector };
};
