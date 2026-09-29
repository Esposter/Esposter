// A rename across the repository, written as data before anything runs: the modules and source directories that own
// The renamed exports, each old name's new one, the accessors through which a renamed name is also read as a property
// (`query` for `db.query.users`), and the import specifiers of the files the rename moved
export interface RenameMap {
  accessors: string[];
  modules: string[];
  renames: Record<string, string>;
  sources: string[];
  specifiers: Record<string, string>;
}
