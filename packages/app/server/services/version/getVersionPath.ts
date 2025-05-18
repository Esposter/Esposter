export const getVersionPath = (version: number, extension: string, prefix = "") =>
  `${prefix ? `${prefix}/` : ""}v${version}.${extension}`;
