// A source file's code words as the stale-names scan last read them, kept beside the file's modification time and size,
// So a file whose both still match is taken from the cache rather than read again. Its comments are blanked first
export interface SourceWordEntry {
  codeWords: string[];
  mtimeMs: number;
  size: number;
}
