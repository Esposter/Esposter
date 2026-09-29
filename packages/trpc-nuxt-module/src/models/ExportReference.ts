// Where a value the module wires into its generated handlers lives: the file, resolved through Nuxt's aliases, and the
// Name it is exported under — the same pair an auto-import entry is written as
export interface ExportReference {
  from: string;
  name: string;
}
