// What an import resolves to inside the repository: the path it names as written, and every file the build would
// Probe for it, the first of which is the path itself
export interface ImportTarget {
  candidates: string[];
  path: string;
}
