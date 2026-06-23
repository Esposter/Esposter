import type { DirSource } from "@/models/source/DirSource";
import type { FilesSource } from "@/models/source/FilesSource";
import type { GitSource } from "@/models/source/GitSource";

export type Source = DirSource | FilesSource | GitSource;
