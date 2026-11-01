import type { CommandRefusal } from "../../models/CommandRefusal";

import { joinDirectory } from "../shell/joinDirectory";
import { getAddRefusal } from "./getAddRefusal";
import { getCheckoutRefusal } from "./getCheckoutRefusal";
import { getCleanRefusal } from "./getCleanRefusal";
import { getResetRefusal } from "./getResetRefusal";
import { getRestoreRefusal } from "./getRestoreRefusal";
import { getStashRefusal } from "./getStashRefusal";
import { getSubcommand } from "./getSubcommand";

const GIT_NAMES: ReadonlySet<string> = new Set(["git", "git.exe"]);

const WHOLE_INDEX_REFUSALS: ReadonlyMap<string, (args: string[]) => string | undefined> = new Map([
  ["add", getAddRefusal],
  ["checkout", getCheckoutRefusal],
  ["clean", getCleanRefusal],
  ["reset", getResetRefusal],
  ["restore", getRestoreRefusal],
  ["stash", getStashRefusal],
]);

// The form refused and the folder git runs in, from the session's ("" for the session's own): the folder a `cd` before
// It moved to, then each of its `-C` folders
export const getGitRefusal: CommandRefusal<{ directory: string; form: string }> = (name, args, directory) => {
  if (!GIT_NAMES.has(name)) return undefined;
  const subcommand = getSubcommand(args);
  const form = WHOLE_INDEX_REFUSALS.get(subcommand.name)?.(subcommand.arguments);
  return form === undefined
    ? undefined
    : { directory: subcommand.directories.reduce((base, next) => joinDirectory(base, next), directory), form };
};
