/** One seam of a Scope agent's territory partition. */
export interface Seam {
  adjacentPathPrefixes?: string[];
  name: string;
  pathPrefixes: string[];
  summary: string;
}
