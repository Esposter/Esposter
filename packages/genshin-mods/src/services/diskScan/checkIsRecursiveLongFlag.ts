// The long form `--recursive`, which getopt also takes as any prefix of it from `--rec` on.
// `--re` would also name two options, so the prefix starts at `--rec`.
export const checkIsRecursiveLongFlag = (token: string): boolean =>
  token.startsWith("--rec") && "recursive".startsWith(token.slice(2));
