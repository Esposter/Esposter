import { InvalidOperationError, Operation } from "@esposter/shared";
import { realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

// The real path of a file the session can name: inside its working directory, and refused once a symlink or a `..`
// takes it out of there
export const resolveRepositoryPath = async (cwd: string, path: string): Promise<string> => {
  const root = await realpath(cwd);
  const target = await realpath(resolve(root, path));
  const relation = relative(root, target);
  if (relation === ".." || relation.startsWith(`..${sep}`) || isAbsolute(relation))
    throw new InvalidOperationError(Operation.Read, path, "the file is outside the session's working directory");
  return target;
};
