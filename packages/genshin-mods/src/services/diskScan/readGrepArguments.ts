// A flag that gives grep its pattern as the next argument, or as the rest of the same one
const SEPARATE_PATTERN_FLAG_REGEX = /^-[a-zA-Z]*[ef]$|^--(?:regexp|file)$/u;
const ATTACHED_PATTERN_FLAG_REGEX = /^-[a-zA-Z]*[ef].|^--(?:regexp|file)=/u;

// Grep's flags and search paths: a pattern flag's operand is its pattern and never a flag or a path, every argument
// After a `--` is a positional one, and with no pattern flag the first positional argument is the pattern
export const readGrepArguments = (args: string[]): { flags: string[]; paths: string[] } => {
  const flags: string[] = [];
  const positionals: string[] = [];
  let hasPatternFlag = false;
  let isPatternOperand = false;
  let isOptionEnd = false;
  for (const arg of args)
    if (isPatternOperand) isPatternOperand = false;
    else if (isOptionEnd || !arg.startsWith("-")) positionals.push(arg);
    else if (arg === "--") isOptionEnd = true;
    else {
      flags.push(arg);
      if (SEPARATE_PATTERN_FLAG_REGEX.test(arg)) {
        hasPatternFlag = true;
        isPatternOperand = true;
      } else if (ATTACHED_PATTERN_FLAG_REGEX.test(arg)) hasPatternFlag = true;
    }
  return { flags, paths: hasPatternFlag ? positionals : positionals.slice(1) };
};
