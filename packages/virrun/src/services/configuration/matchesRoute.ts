// Whether a command is in the routing allowlist, matched by leading tokens: a `route` entry routes a command
// When its tokens are a prefix of the command's. So `pnpm install` matches `pnpm install --frozen-lockfile`
// But not `pnpm test`, and `vitest` matches `vitest run foo.test.ts`. The command may arrive as an argv array
// (the CLI's normal form) or a string; both tokenize on whitespace. Empty entries never match.
export const matchesRoute = (command: readonly string[] | string, route: readonly string[]): boolean => {
  const commandTokens = typeof command === "string" ? command.split(/\s+/u).filter((token) => token !== "") : command;
  return route.some((entry) => {
    const entryTokens = entry.split(/\s+/u).filter((token) => token !== "");
    return entryTokens.length > 0 && entryTokens.every((token, index) => commandTokens[index] === token);
  });
};
