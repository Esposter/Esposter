import { isFlag } from "./isFlag";

// The options git takes before its subcommand, each with its value as the next word
const GIT_VALUE_OPTIONS: ReadonlySet<string> = new Set(["--git-dir", "--namespace", "--work-tree", "-C", "-c"]);

// The subcommand past the options git takes before it, the arguments after the subcommand, and the folders its `-C`
// Options name, each from the one before
export const getSubcommand = (args: string[]) => {
  const directories: string[] = [];
  let index = 0;
  while (index < args.length && isFlag(args[index] ?? "")) {
    if (args[index] === "-C") directories.push(args[index + 1] ?? "");
    index += GIT_VALUE_OPTIONS.has(args[index] ?? "") ? 2 : 1;
  }
  return { arguments: args.slice(index + 1), directories, name: args[index] ?? "" };
};
