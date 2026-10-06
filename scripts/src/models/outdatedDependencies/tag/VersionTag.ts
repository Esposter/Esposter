// A tag read as a version the way Renovate's docker versioning reads one: the numeric release between whatever
// Precedes it (`v`) and whatever follows it (`-uclibc`), which only a tag of the same shape is compared with
export interface VersionTag {
  prefix: string;
  release: number[];
  suffix: string;
}
