// The long form `--recursive`, which getopt also takes as any prefix of it from `--rec` on, since `--re` names two options
export const isRecursiveLongFlag = (token: string) =>
  token.startsWith("--rec") && "recursive".startsWith(token.slice(2));
