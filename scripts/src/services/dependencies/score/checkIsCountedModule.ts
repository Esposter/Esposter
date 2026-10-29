import { MINIFIED_MARKER, MODULE_EXTENSIONS } from "#src/services/dependencies/score/constants";

export const checkIsCountedModule = (file: string): boolean =>
  MODULE_EXTENSIONS.some((extension) => file.endsWith(extension)) && !file.includes(MINIFIED_MARKER);
