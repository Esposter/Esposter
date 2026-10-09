// A staged source file, read from the index, with what its owning package makes an import resolve through
export interface StagedImporter {
  aliases: Readonly<Record<string, unknown>>;
  packageDirectory: string;
  path: string;
  specifiers: readonly string[];
}
