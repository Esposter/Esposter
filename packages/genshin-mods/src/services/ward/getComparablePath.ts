// Windows paths compare as one spelling: forward slashes, lowercase, since the file system ignores case
export const getComparablePath = (path: string) => path.replaceAll("\\", "/").toLowerCase();
