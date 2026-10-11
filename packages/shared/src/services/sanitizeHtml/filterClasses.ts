import { matchesClassPattern } from "#src/services/sanitizeHtml/matchesClassPattern";

// Only the classes a tag's patterns name survive, since a class reaches the app's own stylesheet and an arbitrary one would
// Let markup borrow its utilities. Nothing surviving means the attribute is dropped
export const filterClasses = (value: string, patterns: string[] | undefined): string | undefined => {
  if (!patterns) return undefined;

  const classNames = value
    .split(/\s+/u)
    .filter((className) => className && patterns.some((pattern) => matchesClassPattern(className, pattern)));
  return classNames.length > 0 ? classNames.join(" ") : undefined;
};
