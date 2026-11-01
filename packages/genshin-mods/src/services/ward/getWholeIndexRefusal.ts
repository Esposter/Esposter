import { getShellRefusal } from "../shell/getShellRefusal";
import { getGitRefusal } from "./getGitRefusal";

// The whole-index git form a Bash command runs, named as the form it is, with the folder it runs in, undefined for a
// Path-scoped or read-only command
export const getWholeIndexRefusal = (command: string): undefined | { directory: string; form: string } =>
  getShellRefusal(command, getGitRefusal);
