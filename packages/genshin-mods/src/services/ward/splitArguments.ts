import { checkIsFlag } from "./checkIsFlag";

// The flags, the words before a `--` and the words after it, so a path is read whether or not git was given a separator
export const splitArguments = (
  args: string[],
): { after: string[]; flags: string[]; hasSeparator: boolean; operands: string[] } => {
  const separator = args.indexOf("--");
  const before = separator === -1 ? args : args.slice(0, separator);
  const after = separator === -1 ? [] : args.slice(separator + 1);
  return {
    after,
    flags: before.filter((arg) => checkIsFlag(arg)),
    hasSeparator: separator !== -1,
    operands: [...before.filter((arg) => !checkIsFlag(arg)), ...after],
  };
};
