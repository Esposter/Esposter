import type { AliasSpecifier } from "#src/models/outdatedDependencies/shared/AliasSpecifier";

const ALIAS_SPECIFIER_REGEX = /^npm:(?<packageName>@?[^@]+)(?:@(?<range>.+))?$/u;
// An alias naming no range, `npm:<target>`, installs from the target's `latest`
const DEFAULT_ALIAS_RANGE = "latest";

export const parseAliasSpecifier = (specifier: string): AliasSpecifier | undefined => {
  const groups = ALIAS_SPECIFIER_REGEX.exec(specifier)?.groups;
  const packageName = groups?.packageName;
  if (!packageName) return undefined;
  return { packageName, range: groups.range ?? DEFAULT_ALIAS_RANGE };
};
