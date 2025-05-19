export const getVersionPath = (version: number, prefix = "") => `${prefix ? `${prefix}/` : ""}v${version}`;
