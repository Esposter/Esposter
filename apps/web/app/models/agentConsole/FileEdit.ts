// One change an edit tool made to one file, as the text it replaced and the text it wrote — empty before a file a
// Write created
export interface FileEdit {
  filePath: string;
  id: string;
  newText: string;
  oldText: string;
}
