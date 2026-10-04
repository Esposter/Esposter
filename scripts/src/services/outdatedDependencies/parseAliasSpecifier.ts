import type { AliasSpecifier } from "#src/models/outdatedDependencies/shared/AliasSpecifier";

const ALIAS_SPECIFIER_REGEX = /^npm:(?<packageName>@?[^@]+)@(?<range>.+)$/u;

export const parseAliasSpecifier = (specifier: string): AliasSpecifier | undefined => {
  const groups = ALIAS_SPECIFIER_REGEX.exec(specifier)?.groups;
  const packageName = groups?.packageName;
  const range = groups?.range;
  if (!packageName || !range) return undefined;
  return { packageName, range };
};
