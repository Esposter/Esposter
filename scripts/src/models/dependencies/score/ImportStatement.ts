// One import, export-from or dynamic import a source file makes, as the bundle cost reads it: the names it takes, and whether it takes the whole module
export interface ImportStatement {
  hasNamespace: boolean;
  isSideEffect: boolean;
  isTypeOnly: boolean;
  names: string[];
  specifier: string;
}
