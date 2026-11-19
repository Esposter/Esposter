// The flags that run a subset of the suites: a changed or related set, a name filter, a project and a shard
const SUBSET_FLAGS = ["--changed", "--related", "-t", "--testNamePattern", "--project", "--shard"];

const checkIsSubsetFlag = (arg: string) => SUBSET_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`));

// A run covers every file only when it names no file and no subset flag: a filtered or sharded run sees only some of the
// Suites that call the app's procedures, so a procedure no suite of that run calls is not yet a gap. Its arguments are the
// Vitest command line's, with the subcommand first
export const checkIsFullRun = (args: string[]): boolean =>
  args.every((arg) => arg === "run" || (arg.startsWith("-") && !checkIsSubsetFlag(arg)));
