import { isWholeCheckout } from "./isWholeCheckout";
import { splitArguments } from "./splitArguments";

// `checkout .` and `checkout -- .` overwrite every path's working tree copy, a peer's edits included
export const getCheckoutRefusal = (args: string[]): string | undefined =>
  isWholeCheckout(splitArguments(args).operands) ? "git checkout ." : undefined;
