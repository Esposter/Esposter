import { takeOne } from "@esposter/shared";

export const parseLockResolvedVersions = (sectionText: string, packageIndent: number): Map<string, string> => {
  const childIndent = packageIndent + 2;
  const pattern = new RegExp(
    `[ ]{${packageIndent}}['"]?(?<packageName>[^'":\\n]+)['"]?:\\s*\\n[ ]{${childIndent}}specifier: [^\\n]+\\n[ ]{${childIndent}}version: (?<version>[^\\n]+)`,
    "gu",
  );
  const versions = new Map<string, string>();

  for (const { groups } of sectionText.matchAll(pattern)) {
    const packageName = groups?.packageName;
    const version = groups?.version;
    if (!packageName || !version) continue;

    versions.set(packageName.trim(), takeOne(version.trim().split("(")).trim());
  }

  return versions;
};
