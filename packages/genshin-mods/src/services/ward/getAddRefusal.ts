import { isWholeCheckout } from "./isWholeCheckout";
import { splitArguments } from "./splitArguments";

const ADD_ALL_FLAGS: ReadonlySet<string> = new Set(["--all", "--update", "-A", "-u"]);

// `add .`, `add -A` and `add -N` over every path reach a peer's work, while a named path does not
export const getAddRefusal = (args: string[]): string | undefined => {
  const { flags, operands } = splitArguments(args);
  if (isWholeCheckout(operands)) return "git add .";
  const allFlag = flags.find((flag) => ADD_ALL_FLAGS.has(flag));
  if (allFlag !== undefined && operands.length === 0) return `git add ${allFlag}`;
  const isIntentToAdd = flags.some((flag) => flag === "-N" || flag === "--intent-to-add");
  return isIntentToAdd && operands.length === 0 ? "git add -N" : undefined;
};
