import { PACKAGE_REWRITTEN_PATTERNS } from "#vite/services/constants";
import { checkIsHandWrittenEntry } from "@esposter/configuration/hand-written-entry";

// The files a package's build rewrites, relative to the package. Its entry is one of them only when the build generates
// It: a package that writes `src/index.ts` by hand is rewritten by nothing, so the entry stays an input, and an edit to
// It invalidates the build rather than replaying the `dist` built from the old entry
export const getPackageRewrittenPatterns = (packageRoot: string): string[] =>
  checkIsHandWrittenEntry(packageRoot) ? PACKAGE_REWRITTEN_PATTERNS : [...PACKAGE_REWRITTEN_PATTERNS, "src/index.ts"];
