import { checkIsWholeCheckout } from "./checkIsWholeCheckout";
import { splitArguments } from "./splitArguments";

// `restore .` rewrites every path, staged or in the working tree, so the staged form is refused as the plain one is
export const getRestoreRefusal = (args: string[]) => {
  const { flags, operands } = splitArguments(args);
  if (!checkIsWholeCheckout(operands)) return undefined;
  const isStaged = flags.some((flag) => ["--staged", "-S"].includes(flag));
  return `git restore ${isStaged ? "--staged " : ""}.`;
};
