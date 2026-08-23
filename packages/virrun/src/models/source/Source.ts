import type { DirSource } from "#src/models/source/DirSource";
import type { FilesSource } from "#src/models/source/FilesSource";
import type { GitSource } from "#src/models/source/GitSource";

export type Source = DirSource | FilesSource | GitSource;
