import type { SourceType } from "#src/models/source/SourceType";

export interface DirectorySource {
  // Absolute or relative path to the directory. Empty string means the current process cwd.
  directory: string;
  readonly type: SourceType.Directory;
}
