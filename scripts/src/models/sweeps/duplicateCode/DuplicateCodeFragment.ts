// Where a clone runs in one file: 1-based lines and 0-based columns, from its first token's first character to just
// Past its last token's last
export interface DuplicateCodeFragment {
  end: { column: number; line: number };
  sourceId: string;
  start: { column: number; line: number };
}
