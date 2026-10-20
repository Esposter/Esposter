const DEV_MARKER = " (dev)";
// Pnpm keys an npm alias by its target with the version it resolved to, `nitro-nightly@3.0.1-…`, and a dev alias
// Adds a ` (dev)` marker after that. A plain package is keyed by its name alone. A `renovate.json` rule names the
// Target, so the version and the marker are taken back off the key, the dependency type already carries the marker
export const getPnpmPackageName = (key: string, current: string): string => {
  const unmarkedKey = key.endsWith(DEV_MARKER) ? key.slice(0, -DEV_MARKER.length) : key;
  const versionSuffix = `@${current}`;
  return unmarkedKey.endsWith(versionSuffix) ? unmarkedKey.slice(0, -versionSuffix.length) : unmarkedKey;
};
