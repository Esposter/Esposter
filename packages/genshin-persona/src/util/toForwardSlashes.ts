// A path written into a settings file reads the same in every shell it may be run through
export const toForwardSlashes = (path: string): string => path.replaceAll("\\", "/");
