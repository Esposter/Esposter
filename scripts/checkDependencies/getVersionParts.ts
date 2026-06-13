export const getVersionParts = (
  version: string,
): { major: number; minor: number; patch: number; prerelease: string | undefined } => {
  const [versionBase = "", prerelease] = version.split("-", 2);
  const [major = 0, minor = 0, patch = 0] = versionBase.split(".").map((part) => Number.parseInt(part, 10) || 0);
  return { major, minor, patch, prerelease };
};
