export const splitSubpaths = (path: string): string[] =>
  path
    .split(/(?=M )/u)
    .map((subpath) => subpath.trim())
    .filter(Boolean);
