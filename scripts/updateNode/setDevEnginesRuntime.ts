import { DEV_ENGINES_RUNTIME_VERSION_REGEX } from "#scripts/updateNode/constants";

/** Rewrite a package.json string's `devEngines.runtime.version` to `^${version}`. */
export const setDevEnginesRuntime = (packageJson: string, version: string): string => {
  if (!DEV_ENGINES_RUNTIME_VERSION_REGEX.test(packageJson))
    throw new Error("Could not find devEngines.runtime.version in package.json");

  return packageJson.replace(DEV_ENGINES_RUNTIME_VERSION_REGEX, `$<lead>^${version}`);
};
