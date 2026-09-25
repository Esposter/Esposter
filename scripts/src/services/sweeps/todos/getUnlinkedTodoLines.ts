// A marker is a workaround waiting on something outside the repository, and the link is how anyone learns that it
// Ended — so the marker is followed by the address of the thing that ends it, and nothing else comes first. The one
// Other form says no upstream issue exists yet, which the `todos` skill lists until one is filed
const UNLINKED_TODO_REGEX = /@TODO(?!: (?:https?:\/\/|no upstream issue\b))/u;
// The line number of every line holding a marker neither a link nor the unfiled form follows.
export const getUnlinkedTodoLines = (text: string): number[] =>
  text.split("\n").flatMap((line, index) => (UNLINKED_TODO_REGEX.test(line) ? [index + 1] : []));
