import { ENGINES_NODE_REGEX } from "#src/updateNode/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

/** Current `engines.node` version from a package.json string, with any leading `^` stripped. */
export const getEnginesNode = (packageJson: string): string => {
  const version = packageJson.match(ENGINES_NODE_REGEX)?.groups?.version?.replace(/^\^/u, "");
  if (!version)
    throw new InvalidOperationError(Operation.Read, getEnginesNode.name, "Could not find engines.node in package.json");

  return version;
};
