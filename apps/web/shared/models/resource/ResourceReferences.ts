import type { LinkedResource } from "#shared/models/resource/LinkedResource";

// Both directions of the resource-link index around one resource
export interface ResourceReferences {
  // The caller's live resources that reference it
  consumers: LinkedResource[];
  // The live resources of the caller's own that its content references, each once whatever roles it plays
  dependencies: LinkedResource[];
  // The references its content holds to a resource deleted, binned or another owner's, which the caller cannot read
  missingDependencyCount: number;
}
