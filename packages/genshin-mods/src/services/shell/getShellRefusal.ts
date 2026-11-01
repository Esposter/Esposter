import type { CommandRefusal } from "../../models/CommandRefusal";

import { getDollarSubstitutionBodies } from "./getDollarSubstitutionBodies";
import { joinDirectory } from "./joinDirectory";
import { tokenize } from "./tokenize";

// A shell command passed as one argument (`bash -c "…"`) is read again on its own, to this depth at most
const MAX_NESTING_DEPTH = 3;

// A segment runs up to a separator outside quotes, so a quoted argument such as a `bash -c` command stays whole
const SEGMENT_REGEX = /(?:"[^"]*"|'[^']*'|[^\n"&'();`|])+/gu;
// A backtick substitution runs even inside double quotes, so its body is read again on its own
const BACKTICK_SUBSTITUTION_REGEX = /`(?<body>[^`]*)`/gu;
const SHELL_FLAG_REGEX = /^-[a-zA-Z]*c$|^eval$/u;
const PATH_SEPARATOR_REGEX = /[/\\]/u;

// The refusal of the first command in a Bash command that the given reader refuses, undefined when none does. A `cd`
// Moves every command after it in the line; one to a home folder or back to the last is not followed
export const getShellRefusal = <T = string>(
  command: string,
  getRefusal: CommandRefusal<T>,
  depth = 0,
  startDirectory = "",
): T | undefined => {
  if (depth < MAX_NESTING_DEPTH)
    for (const body of [
      ...getDollarSubstitutionBodies(command),
      ...Array.from(command.matchAll(BACKTICK_SUBSTITUTION_REGEX), (match) => match.groups?.body ?? ""),
    ]) {
      const nested = getShellRefusal(body, getRefusal, depth + 1, startDirectory);
      if (nested !== undefined) return nested;
    }
  let directory = startDirectory;
  for (const segment of command.match(SEGMENT_REGEX) ?? []) {
    const tokens = tokenize(segment);
    const [commandName, target] = tokens;
    if (commandName === "cd" && target !== undefined && !target.startsWith("~") && !target.startsWith("-"))
      directory = joinDirectory(directory, target);
    for (const [index, token] of tokens.entries()) {
      const name = token.split(PATH_SEPARATOR_REGEX).pop() ?? "";
      const refusal = getRefusal(name, tokens.slice(index + 1), directory);
      if (refusal !== undefined) return refusal;
      const previous = tokens[index - 1];
      if (depth < MAX_NESTING_DEPTH && previous !== undefined && SHELL_FLAG_REGEX.test(previous) && /\s/u.test(token)) {
        const nested = getShellRefusal(token, getRefusal, depth + 1, directory);
        if (nested !== undefined) return nested;
      }
    }
  }
  return undefined;
};
