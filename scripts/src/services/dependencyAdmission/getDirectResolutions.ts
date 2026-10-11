import { takeOne } from "@esposter/shared";

// An importer's entry for a catalog dependency: its name, then `specifier: catalog:` and the resolved version
const IMPORTER_CATALOG_REGEX =
  /^ {6}['"]?(?<name>[^'":\n]+)['"]?:\n {8}specifier: ['"]?catalog:['"]?\n {8}version: ['"]?(?<version>[^'"\n]+)/gmu;

// Maps each catalog name an importer depends on to the `packages:` key its resolution is recorded under. An alias's
// Version already names its package (`@nuxt/kit-nightly@5.0.0-…`), any other is the catalog name at that version. Peer suffixes
// `(…)` are dropped, as the `packages:` keys carry none.
export const getDirectResolutions = (lockYaml: string): Map<string, string> => {
  const resolutions = new Map<string, string>();

  for (const { groups } of lockYaml.matchAll(IMPORTER_CATALOG_REGEX)) {
    const name = groups?.name?.trim();
    const version = groups?.version?.trim();
    if (!name || !version) continue;

    const resolvedVersion = takeOne(version.split("("));
    resolutions.set(name, resolvedVersion.includes("@", 1) ? resolvedVersion : `${name}@${resolvedVersion}`);
  }

  return resolutions;
};
