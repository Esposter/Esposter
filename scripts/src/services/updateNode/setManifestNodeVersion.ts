import {
  DEV_ENGINES_KEY,
  ENGINES_NODE_REGEX,
  FLAT_OBJECT_REGEX,
  NODE_RUNTIME_NAME_REGEX,
  RUNTIME_VERSION_REGEX,
} from "#src/services/updateNode/constants";

/**
 * Rewrite a package.json's node floors to `>=${version}`: its `engines.node` and the `node` entry of its
 * `devEngines.runtime`, object or array form. A string edit, so every other byte of the manifest is kept.
 */
export const setManifestNodeVersion = (manifestJson: string, version: string): string => {
  const floor = `>=${version}`;
  const withEngines = manifestJson.replace(ENGINES_NODE_REGEX, `$<lead>${floor}`);
  const devEnginesIndex = withEngines.indexOf(DEV_ENGINES_KEY);
  if (devEnginesIndex === -1) return withEngines;

  const devEngines = withEngines
    .slice(devEnginesIndex)
    .replace(FLAT_OBJECT_REGEX, (runtimeEntry) =>
      NODE_RUNTIME_NAME_REGEX.test(runtimeEntry)
        ? runtimeEntry.replace(RUNTIME_VERSION_REGEX, `$<lead>${floor}`)
        : runtimeEntry,
    );
  return withEngines.slice(0, devEnginesIndex) + devEngines;
};
