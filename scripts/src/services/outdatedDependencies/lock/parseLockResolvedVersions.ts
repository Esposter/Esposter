export const parseLockResolvedVersions = (sectionText: string, pkgIndent: number): Map<string, string> => {
  const childIndent = pkgIndent + 2;
  const pattern = new RegExp(
    `[ ]{${pkgIndent}}['"]?(?<pkg>[^'":\\n]+)['"]?:\\s*\\n[ ]{${childIndent}}specifier: [^\\n]+\\n[ ]{${childIndent}}version: (?<version>[^\\n]+)`,
    "gu",
  );
  const versions = new Map<string, string>();

  for (const { groups } of sectionText.matchAll(pattern)) {
    const pkg = groups?.pkg;
    const version = groups?.version;
    if (!pkg || !version) continue;

    versions.set(pkg.trim(), version.trim().split("(")[0]?.trim() ?? "");
  }

  return versions;
};
