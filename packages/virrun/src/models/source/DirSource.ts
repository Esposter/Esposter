import type { SourceType } from "@/models/source/SourceType";

export interface DirSource {
  // Absolute or relative path to the directory. Empty string means the current process cwd.
  dir: string;
  readonly type: SourceType.Dir;
}
