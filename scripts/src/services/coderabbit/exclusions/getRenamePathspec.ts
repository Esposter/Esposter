// What to pass `git diff --` so it can still see the rename. One path filters the counterpart out of the pair and
// Git reports a whole new file instead; a path that did not move has only itself to give.
export const getRenamePathspec = (path: string, renamedFromPaths: ReadonlyMap<string, string>): string[] => {
  const oldPath = renamedFromPaths.get(path);
  return oldPath === undefined ? [path] : [oldPath, path];
};
