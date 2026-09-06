// The first two segments of a repo-relative path, which is the package that owns it (`packages/shared`).
export const getPackagePath = (path: string): string => path.split("/").slice(0, 2).join("/");
