import { isRecursiveFlag } from "./isRecursiveFlag";
import { isRoot } from "./isRoot";
import { readGrepArguments } from "./readGrepArguments";

// A flag group holding the scan's recursive letter, or the long form: grep takes r or R (`-R`, `-rn`, `-lR`), and ls takes
// The capital R alone, since its lowercase r sorts in reverse
const GREP_RECURSIVE_FLAG_REGEX = /^-[a-zA-Z]*[rR]/u;
const LS_RECURSIVE_FLAG_REGEX = /^-[a-zA-Z]*R/u;

// The scan's name when its arguments start it from a root, undefined when they do not
export const getScanRefusal = (name: string, args: string[]): string | undefined => {
  if (name === "find" || name === "du") return args.some((arg) => isRoot(arg)) ? name : undefined;
  if (name === "ls")
    return args.some((arg) => isRecursiveFlag(arg, LS_RECURSIVE_FLAG_REGEX)) && args.some((arg) => isRoot(arg))
      ? name
      : undefined;
  const { flags, paths } = readGrepArguments(args);
  return flags.some((flag) => isRecursiveFlag(flag, GREP_RECURSIVE_FLAG_REGEX)) && paths.some((path) => isRoot(path))
    ? name
    : undefined;
};
