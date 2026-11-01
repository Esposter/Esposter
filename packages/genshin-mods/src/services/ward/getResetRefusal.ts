import { isWholeCheckout } from "./isWholeCheckout";
import { splitArguments } from "./splitArguments";

// The reset modes that touch the working tree or the index beyond HEAD, so a reset with one of them is not a commit move
const RESET_INDEX_MODES: ReadonlySet<string> = new Set(["--hard", "--keep", "--merge", "--mixed"]);

// A reset that names a path is path-scoped: after `--`, or as a second operand with none, since git reads the first
// As a commit or a path and every one after it as a path. The checkout's own pathspec names no commit, so it is the
// Whole checkout in either place. A lone operand may be a commit, so it is refused, and a reset that moves HEAD alone
// With `--soft` leaves the index as it is; every other reset rewrites the index to HEAD or the working tree, a peer's
// Staged entries included
export const getResetRefusal = (args: string[]): string | undefined => {
  const { after, flags, hasSeparator, operands } = splitArguments(args);
  if (isWholeCheckout(hasSeparator ? after : operands)) return "git reset -- .";
  const paths = hasSeparator ? after : operands.slice(1);
  if (paths.length > 0) return undefined;
  const isSoftOnly = flags.includes("--soft") && !flags.some((flag) => RESET_INDEX_MODES.has(flag));
  return isSoftOnly ? undefined : "git reset";
};
