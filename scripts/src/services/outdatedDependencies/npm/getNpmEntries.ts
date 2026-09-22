import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { PackageManifest } from "@esposter/configuration";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { DEPENDENCY_FIELDS } from "#src/models/shared/DependencyField";

// Every field, not `dependencies` alone: a manifest npm installs declares no devDependencies by design, and the
// One that starts to should be checked rather than silently skipped.
export const getNpmEntries = (manifestName: string, manifest: PackageManifest): DependencyEntry[] =>
  DEPENDENCY_FIELDS.flatMap((field) =>
    Object.entries(manifest[field] ?? {}).map(([packageName, specifier]) => ({
      dependent: manifestName,
      group: DependencyGroup.Npm,
      packageName,
      specifier,
    })),
  );
