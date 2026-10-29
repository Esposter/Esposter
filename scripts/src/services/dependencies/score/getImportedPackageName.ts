// A specifier's package: its first segment, or the first two for a scoped name, so a subpath counts toward its package
export const getImportedPackageName = (specifier: string): string => {
  const segments = specifier.split("/");
  return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : (segments[0] ?? "");
};
