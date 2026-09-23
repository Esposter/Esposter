// One change an edit tool made to one file, as the text it replaced and the text it wrote — empty before a file a
// Write created
export interface FileEdit {
  filePath: string;
  id: string;
  // Every occurrence of the replaced text changed rather than the one; a merge of a file's edits replays it so
  isReplaceAll: boolean;
  newText: string;
  oldText: string;
}
