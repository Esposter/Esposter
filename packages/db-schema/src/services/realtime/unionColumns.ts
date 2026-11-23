// The columns a watch or a publish names together with another's. A list that names every column (undefined) keeps
// Naming Every column, and otherwise the two lists' columns are held once each
export const unionColumns = (first: string[] | undefined, second: string[] | undefined): string[] | undefined =>
  first === undefined || second === undefined ? undefined : [...new Set([...first, ...second])];
