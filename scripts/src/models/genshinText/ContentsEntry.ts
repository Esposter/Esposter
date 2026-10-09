// One entry of a directory listing from the GitHub contents API: its path from the repository root and its size in bytes
export interface ContentsEntry {
  path: string;
  size: number;
}
