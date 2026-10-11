import { CMD_META_CHARACTERS_REGEX } from "#src/services/exec/spawn/constants";

// A backslash run is literal, except one that ends at a quote or at the end of the argument: that run is doubled, and
// A quote is written `\"` so the MSVCRT parser node uses reads it as a quote. The loop is linear, where a regular
// Expression over the run backtracks on a long one.
const escapeBackslashes = (argument: string): string => {
  let escaped = "";
  let backslashes = 0;
  for (const character of argument) {
    if (character === "\\") {
      backslashes++;
      continue;
    }
    if (character === '"') escaped += `${"\\".repeat(backslashes * 2)}\\"`;
    else escaped += "\\".repeat(backslashes) + character;
    backslashes = 0;
  }
  return escaped + "\\".repeat(backslashes * 2);
};

// Quotes an argument and escapes it for cmd.exe, so every metacharacter in it reaches the child as data. The escaping
// Is applied after quoting, so the quotes are escaped too. Only a command line for cmd.exe carries an argument, and a
// Batch file's line re-parses the `%*` it expands, so the argument is escaped a second time as well: the batch file's
// Own line is what the second pass is for.
export const escapeCmdArgument = (argument: string): string => {
  const quoted = `"${escapeBackslashes(argument)}"`;
  return quoted
    .replaceAll(CMD_META_CHARACTERS_REGEX, "^$<character>")
    .replaceAll(CMD_META_CHARACTERS_REGEX, "^$<character>");
};
