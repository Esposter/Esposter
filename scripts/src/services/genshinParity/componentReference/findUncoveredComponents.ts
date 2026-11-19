// The drawn components that no reference holds and no ledger row owes. A row covers its folder and every component
// Beneath it, since a folder's pieces are owed with the folder that holds them
export const findUncoveredComponents = (
  drawn: readonly string[],
  held: ReadonlySet<string>,
  ledgerFolders: readonly string[],
): string[] =>
  drawn.filter((path) => !held.has(path) && !ledgerFolders.some((folder) => path.startsWith(`${folder}/`)));
