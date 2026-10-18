// The text after a prefix on the first line of a session-start hook's context that starts with it, or "" when no line
// does, so a theme reads its own lines by their prefixes rather than by the prose around them
export const getSessionStartLine = (sessionStartContext: string, prefix: string): string =>
  sessionStartContext
    .split("\n")
    .find((line) => line.startsWith(prefix))
    ?.slice(prefix.length) ?? "";
