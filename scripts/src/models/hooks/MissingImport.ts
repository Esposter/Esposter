// A staged file's import whose target is in neither HEAD nor the commit's staged set
export interface MissingImport {
  importingPath: string;
  missingPath: string;
  specifier: string;
}
