import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";
import { checkIsValidRange } from "#src/services/semver/checkIsValidRange";

// The dist-tag a specifier installs from (`latest`, or a release line's own tag such as a nightly's `5x`), or ""
// When it is anything else. A tag is what npm reads one as: no range parses it, and it needs no URI encoding, which
// Is what keeps a protocol specifier (`file:`, `git+https:`) from being taken for one
export const getDistTag = (specifier: string): string => {
  const range = parseAliasSpecifier(specifier)?.range ?? specifier;
  return !checkIsValidRange(range) && encodeURIComponent(range) === range ? range : "";
};
