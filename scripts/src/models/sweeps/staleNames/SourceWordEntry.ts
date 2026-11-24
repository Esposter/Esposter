// A source file as the stale-names scan last read it, kept beside the file's modification time and size, so a file
// Whose both still match is taken from the cache rather than read again. Its code words are its words with its comments
// Blanked, and its comments are the bodies blanked from it, which the citations read
export interface SourceWordEntry {
  codeWords: string[];
  comments: string[];
  mtimeMs: number;
  size: number;
}
