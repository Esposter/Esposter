import { LONG_PATHS_ENABLED_REGEX } from "#src/services/setup/constants";

// `reg query` prints the value as its name, its type and its hex number, which reads `0x1` once long paths are on
export const checkIsLongPathsEnabled = (output: string | null): boolean =>
  output !== null && LONG_PATHS_ENABLED_REGEX.test(output);
