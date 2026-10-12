// A file a batch reviews: its repository-relative path and the lines it changed (added plus deleted)
export interface ReviewFile {
  lines: number;
  path: string;
}
