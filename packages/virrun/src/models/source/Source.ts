import type { DirectorySource } from "#src/models/source/DirectorySource";
import type { FilesSource } from "#src/models/source/FilesSource";
import type { GitSource } from "#src/models/source/GitSource";

export type Source = DirectorySource | FilesSource | GitSource;
