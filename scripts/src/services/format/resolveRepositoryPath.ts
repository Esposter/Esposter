import { resolveCheckoutRoot } from "#src/services/format/resolveCheckoutRoot";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { isAbsolute, relative, resolve } from "node:path";

const OUTSIDE_CHECKOUT_REGEX = /^\.\.(?:\/|$)/u;

// A path given on a command line names a file read against the directory the command was typed in, which `pnpm -C`
// Moves to `scripts`. The file must lie in the main checkout or one of its worktrees, and it is returned with the
// Checkout it lies in and its own path within that checkout, with `/` separators
export const resolveRepositoryPath = (
  path: string,
  invocationDirectory: string,
  mainCheckoutRoot: string,
): { checkoutRoot: string; repositoryPath: string } => {
  const absolutePath = resolve(invocationDirectory, path);
  const mainPath = relative(mainCheckoutRoot, absolutePath).replaceAll("\\", "/");
  // eslint-disable-next-line no-restricted-syntax -- a path, empty when unset
  if (mainPath === "" || isAbsolute(mainPath) || OUTSIDE_CHECKOUT_REGEX.test(mainPath))
    throw new InvalidOperationError(Operation.Read, path, "it is not a file in this repository");
  const checkoutRoot = resolveCheckoutRoot(absolutePath, mainCheckoutRoot);
  return { checkoutRoot, repositoryPath: relative(checkoutRoot, absolutePath).replaceAll("\\", "/") };
};
