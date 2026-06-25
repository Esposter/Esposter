import { ENGINES_NODE_REGEX } from "@/updateNode/constants";

/** Rewrite a package.json string's `engines.node` to `^${version}`. */
export const setEnginesNode = (packageJson: string, version: string): string => {
  if (!ENGINES_NODE_REGEX.test(packageJson)) throw new Error("Could not find engines.node in package.json");

  return packageJson.replace(ENGINES_NODE_REGEX, `$<lead>^${version}`);
};
