export interface RepositoryFile {
  content: string;
  // Empty when the file's text is in content, else why the view cannot show it
  notice: string;
}
