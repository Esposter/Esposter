// A source file's words as the stale-names scan last read them, kept beside the file's modification time and size, so a
// File whose both still match is taken from the cache rather than read again
export interface SourceWordEntry {
  mtimeMs: number;
  size: number;
  words: string[];
}
