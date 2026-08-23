import type { SourceType } from "#src/models/source/SourceType";

export interface GitSource {
  // Branch, tag, or commit to check out. Empty string clones the remote's default branch.
  ref: string;
  // Clone URL or local path of the repository.
  repo: string;
  readonly type: SourceType.Git;
}
