import { DEV_ENGINES_RUNTIME_VERSION_REGEX } from "#scripts/updateNode/constants";
import { setVersion } from "#scripts/updateNode/setVersion";

/** Rewrite a package.json string's `devEngines.runtime.version` to `^${version}`. */
export const setDevEnginesRuntime = (packageJson: string, version: string): string =>
  setVersion(packageJson, DEV_ENGINES_RUNTIME_VERSION_REGEX, version, "devEngines.runtime.version in package.json");
