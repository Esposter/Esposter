import { ENGINES_NODE_REGEX } from "#src/updateNode/constants";
import { setVersion } from "#src/updateNode/setVersion";

/** Rewrite a package.json string's `engines.node` to `^${version}`. */
export const setEnginesNode = (packageJson: string, version: string): string =>
  setVersion(packageJson, ENGINES_NODE_REGEX, version, "engines.node in package.json");
