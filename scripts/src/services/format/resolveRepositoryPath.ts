import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { isAbsolute, relative, resolve } from "node:path";

const OUTSIDE_CHECKOUT_REGEX = /^\.\.(?:\/|$)/u;

// A path given on a command line names a file read against the directory the command was typed in, which `pnpm -C`
// Moves to `scripts`; the file it names must lie in this checkout, so the path is kept repository-relative with `/`
export const resolveRepositoryPath = (path: string, invocationDirectory: string): string => {
  const repositoryPath = relative(REPOSITORY_ROOT, resolve(invocationDirectory, path)).replaceAll("\\", "/");
  if (repositoryPath === "" || isAbsolute(repositoryPath) || OUTSIDE_CHECKOUT_REGEX.test(repositoryPath))
    throw new InvalidOperationError(Operation.Read, path, "it is not a file in this checkout");
  return repositoryPath;
};
