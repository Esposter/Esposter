// Which of a rename map's names one source binds, and the import statements that bind them
export interface BoundNames {
  // Imported under an alias, so renamed in the import alone
  aliasedNames: Set<string>;
  // Imported by name or declared by the source, so renamed wherever the code reads them
  boundNames: Set<string>;
  importRegex: RegExp;
}
