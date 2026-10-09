import type { CommandRefusal } from "../shell/getShellRefusal";

import { getShellRefusal } from "../shell/getShellRefusal";

const GIT_NAMES: ReadonlySet<string> = new Set(["git", "git.exe"]);

// The options git takes before its subcommand, each with its value as the next word
const GIT_VALUE_OPTIONS: ReadonlySet<string> = new Set(["-C", "-c"]);

// The reset modes that touch the working tree or the index beyond HEAD, so a reset with one of them is not a commit move
const RESET_INDEX_MODES: ReadonlySet<string> = new Set(["--hard", "--keep", "--merge", "--mixed"]);

const ADD_ALL_FLAGS: ReadonlySet<string> = new Set(["--all", "--update", "-A", "-u"]);

const isFlag = (arg: string) => arg.startsWith("-");

// The flags, the words before a `--` and the words after it, so a path is read whether or not git was given a separator
const splitArguments = (args: string[]) => {
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

// The subcommand past the options git takes before it, and the arguments after the subcommand
const getSubcommand = (args: string[]) => {
  let index = 0;
  while (index < args.length && isFlag(args[index] ?? "")) index += GIT_VALUE_OPTIONS.has(args[index] ?? "") ? 2 : 1;
  return { arguments: args.slice(index + 1), name: args[index] ?? "" };
};

// `add .`, `add -A` and `add -N` over every path reach a peer's work, while a named path does not
const getAddRefusal = (args: string[]): string | undefined => {
  const { flags, operands } = splitArguments(args);
  if (operands.includes(".")) return "git add .";
  const allFlag = flags.find((flag) => ADD_ALL_FLAGS.has(flag));
  if (allFlag !== undefined && operands.length === 0) return `git add ${allFlag}`;
  const isIntentToAdd = flags.some((flag) => flag === "-N" || flag === "--intent-to-add");
  return isIntentToAdd && operands.length === 0 ? "git add -N" : undefined;
};

// A reset that names a path after `--` is path-scoped, and one that moves HEAD alone with `--soft` leaves the index
// As it is; every other reset rewrites the index to HEAD or the working tree, a peer's staged entries included
const getResetRefusal = (args: string[]): string | undefined => {
  const { after, flags, hasSeparator } = splitArguments(args);
  if (hasSeparator) return after.includes(".") ? "git reset -- ." : after.length > 0 ? undefined : "git reset";
  const isSoftOnly = flags.includes("--soft") && !flags.some((flag) => RESET_INDEX_MODES.has(flag));
  return isSoftOnly ? undefined : "git reset";
};

// `restore .` rewrites every path, staged or in the working tree, so the staged form is refused as the plain one is
const getRestoreRefusal = (args: string[]): string | undefined => {
  const { flags, operands } = splitArguments(args);
  if (!operands.includes(".")) return undefined;
  const isStaged = flags.some((flag) => flag === "--staged" || flag === "-S");
  return `git restore ${isStaged ? "--staged " : ""}.`;
};

// A stash in any form sets a peer's work aside, which is why the git skill never runs one
const getStashRefusal = (): string => "git stash";

// `checkout .` and `checkout -- .` overwrite every path's working tree copy, a peer's edits included
const getCheckoutRefusal = (args: string[]): string | undefined =>
  splitArguments(args).operands.includes(".") ? "git checkout ." : undefined;

// A clean deletes every untracked file, a peer's new ones included; a dry run lists them and is allowed
const getCleanRefusal = (args: string[]): string | undefined => {
  const { flags } = splitArguments(args);
  const isDryRun = flags.some((flag) => flag === "--dry-run" || (!flag.startsWith("--") && flag.includes("n")));
  return isDryRun ? undefined : "git clean";
};

const WHOLE_INDEX_REFUSALS: ReadonlyMap<string, (args: string[]) => string | undefined> = new Map([
  ["add", getAddRefusal],
  ["checkout", getCheckoutRefusal],
  ["clean", getCleanRefusal],
  ["reset", getResetRefusal],
  ["restore", getRestoreRefusal],
  ["stash", getStashRefusal],
]);

const getGitRefusal: CommandRefusal = (name, args) => {
  if (!GIT_NAMES.has(name)) return undefined;
  const subcommand = getSubcommand(args);
  return WHOLE_INDEX_REFUSALS.get(subcommand.name)?.(subcommand.arguments);
};

// The whole-index git form a Bash command runs, named as the form it is, undefined for a path-scoped or read-only command
export const getWholeIndexRefusal = (command: string): string | undefined => getShellRefusal(command, getGitRefusal);

// The path-scoped forms that do the same job for the paths the session touched, named for the person's shared checkout
export const getWholeIndexDenyReason = (form: string, peerPath: string): string =>
  [
    `Refused: \`${form}\` reaches the staged and working changes of another session in this checkout, which is editing ${peerPath} now. Name the paths you touched instead:`,
    "- `git add <path>` to stage them;",
    "- `git reset -- <path>` to unstage them;",
    '- `git commit -m "…" -- <path>` to commit only them.',
    "The git skill's rule (`.agents/skills/git/SKILL.md`) owns the whole-index list.",
  ].join("\n");
