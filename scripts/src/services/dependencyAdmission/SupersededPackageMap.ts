import type { SupersededPackage } from "#src/models/dependencyAdmission/SupersededPackage";

// A predecessor that its successor replaced without npm marking it deprecated. Each entry is seeded only from the
// successor's own README or repository, so a source that does not name the predecessor is not an entry yet.
export const SupersededPackageMap = {} as const satisfies Record<string, SupersededPackage>;
