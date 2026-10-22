// A file a batch reviews: its repository-relative path, the lines it changed (added plus deleted), and the characters its diff holds
export interface ReviewFile {
  characters: number;
  lines: number;
  path: string;
}
