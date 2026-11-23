// A file a batch reviews: its repository-relative path, the lines it changed (added plus deleted), and the characters
// Its diff holds
export interface ReviewFile {
  characters: number;
  lines: number;
  path: string;
}
