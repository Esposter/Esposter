import { EXCLUDED_PATH_PATTERNS } from "#src/services/review/constants";
import { globToRegex } from "#src/services/review/globToRegex";

const EXCLUDED_PATH_REGEXES: RegExp[] = EXCLUDED_PATH_PATTERNS.map((pattern) => globToRegex(pattern));

// Whether a repository-relative path is one a review does not read (`EXCLUDED_PATH_PATTERNS`)
export const checkIsExcludedPath = (path: string): boolean => EXCLUDED_PATH_REGEXES.some((regex) => regex.test(path));
