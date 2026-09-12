const SourcePrefixes = ["apps/web/app/", "apps/web/server/", "apps/web/shared/"];
const SOURCE_REGEX = /^(?:apps|packages)\/[^/]+\/src\//u;

// Production source only: a package's `src/` and the three trees the app keeps outside one.
export const checkIsInScope = (path: string): boolean =>
  !path.includes(".test.") && (SOURCE_REGEX.test(path) || SourcePrefixes.some((prefix) => path.startsWith(prefix)));
