// Parse a pid embedded in a cache filename — a temp's owner segment (`<pid>.<mkdtempRandom>`) or a lease's bare name.
// `Number.parseInt` (not `Number` coercion) is required: it reads the leading integer and stops at the `.`, whereas
// `Number("<pid>.<rand>")` is NaN. Returns undefined for a non-integer name (a published bare / legacy entry).
export const parsePid = (value: string): number | undefined => {
  // oxlint-disable-next-line unicorn/prefer-number-coercion
  const pid = Number.parseInt(value, 10);
  return Number.isInteger(pid) ? pid : undefined;
};
