// A shell command passed as one argument (`bash -c "…"`) is read again on its own, to this depth at most
const MAX_NESTING_DEPTH = 3;

// A segment runs up to a separator outside quotes, so a quoted argument such as a `bash -c` command stays whole
const SEGMENT_REGEX = /(?:"[^"]*"|'[^']*'|[^\n"&'();`|])+/gu;
// A command substitution runs even inside double quotes, so its body is read again on its own
const SUBSTITUTION_REGEX = /\$\((?<dollar>[^()]*)\)|`(?<backtick>[^`]*)`/gu;
const SHELL_FLAG_REGEX = /^-[a-zA-Z]*c$|^eval$/u;
const TOKEN_REGEX = /"(?<double>[^"]*)"|'(?<single>[^']*)'|(?<bare>\S+)/gu;
const PATH_SEPARATOR_REGEX = /[/\\]/u;

// The refusal for a command's name and the arguments after it, undefined when the command is not one the guard reads
export type CommandRefusal = (name: string, args: string[]) => string | undefined;

// A quoted argument keeps its inner spaces, so a shell command passed as one argument is read again on its own
const tokenize = (segment: string) =>
  Array.from(
    segment.matchAll(TOKEN_REGEX),
    (match) => match.groups?.double ?? match.groups?.single ?? match.groups?.bare ?? "",
  );

// The refusal of the first command in a Bash command that the given reader refuses, undefined when none does
export const getShellRefusal = (command: string, getRefusal: CommandRefusal, depth = 0): string | undefined => {
  if (depth < MAX_NESTING_DEPTH)
    for (const match of command.matchAll(SUBSTITUTION_REGEX)) {
      const nested = getShellRefusal(match.groups?.dollar ?? match.groups?.backtick ?? "", getRefusal, depth + 1);
      if (nested !== undefined) return nested;
    }
  for (const segment of command.match(SEGMENT_REGEX) ?? []) {
    const tokens = tokenize(segment);
    for (const [index, token] of tokens.entries()) {
      const name = token.split(PATH_SEPARATOR_REGEX).pop() ?? "";
      const refusal = getRefusal(name, tokens.slice(index + 1));
      if (refusal !== undefined) return refusal;
      const previous = tokens[index - 1];
      if (depth < MAX_NESTING_DEPTH && previous !== undefined && SHELL_FLAG_REGEX.test(previous) && /\s/u.test(token)) {
        const nested = getShellRefusal(token, getRefusal, depth + 1);
        if (nested !== undefined) return nested;
      }
    }
  }
  return undefined;
};
