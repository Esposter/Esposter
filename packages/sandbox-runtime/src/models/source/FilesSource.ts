import type { SourceType } from "@/models/source/SourceType";

export interface FilesSource {
  // Map of relative file path to file content, written verbatim into a fresh temp directory.
  files: Record<string, string>;
  readonly type: SourceType.Files;
}
