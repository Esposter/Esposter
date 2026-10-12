import type { SupersededPackage } from "#src/models/dependencyAdmission/SupersededPackage";

// A predecessor that its successor replaced without npm marking it deprecated. Each entry is seeded only from the
// Successor's own README or repository, or from the repository a rename moved to, so a source that does not name the
// Predecessor is not an entry yet.
export const SupersededPackageMap = {
  radix3: {
    source: "https://github.com/unjs/radix3 (redirects to h3js/rou3: the repository was renamed)",
    successor: "rou3",
  },
} as const satisfies Record<string, SupersededPackage>;
