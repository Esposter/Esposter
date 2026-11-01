import { isFlag } from "./isFlag";

// The flags, the words before a `--` and the words after it, so a path is read whether or not git was given a separator
export const splitArguments = (args: string[]) => {
  const separator = args.indexOf("--");
  const before = separator === -1 ? args : args.slice(0, separator);
  const after = separator === -1 ? [] : args.slice(separator + 1);
  return {
    after,
    flags: before.filter((arg) => isFlag(arg)),
    hasSeparator: separator !== -1,
    operands: [...before.filter((arg) => !isFlag(arg)), ...after],
  };
};
