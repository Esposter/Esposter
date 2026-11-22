import { DUPLICATE_CODE_SCOPES } from "#src/services/sweeps/duplicateCode/constants";

// The app's trees are the duplicate-code scan's apps/web scopes, so one list names them for both scans
const SOURCE_PREFIXES = DUPLICATE_CODE_SCOPES.filter((scope) => scope.startsWith("apps/web/")).map(
  (scope) => `${scope}/`,
);
const SOURCE_REGEX = /^(?:apps|packages)\/[^/]+\/src\//u;
// Production source only: a package's `src/` and the three trees the app keeps outside one.
export const checkIsInScope = (path: string): boolean =>
  !path.includes(".test.") && (SOURCE_REGEX.test(path) || SOURCE_PREFIXES.some((prefix) => path.startsWith(prefix)));
