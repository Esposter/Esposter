import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";
import { validRange } from "semver";

// The dist-tag a specifier installs from (`latest`, or a release line's own tag such as a nightly's `5x`), or ""
// When it is a version range: a tag is whatever no range parses as
export const getDistTag = (specifier: string): string => {
  const range = parseAliasSpecifier(specifier)?.range ?? specifier;
  return validRange(range) === null ? range : "";
};
