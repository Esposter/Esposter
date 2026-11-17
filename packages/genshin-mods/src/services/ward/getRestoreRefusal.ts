import { checkIsWholeCheckout } from "./checkIsWholeCheckout";
import { splitArguments } from "./splitArguments";

// `restore .` rewrites every path, staged or in the working tree, so the staged form is refused as the plain one is
export const getRestoreRefusal = (args: string[]): string | undefined => {
  const { flags, operands } = splitArguments(args);
  if (!checkIsWholeCheckout(operands)) return undefined;
  const isStaged = flags.some((flag) => flag === "--staged" || flag === "-S");
  return `git restore ${isStaged ? "--staged " : ""}.`;
};
