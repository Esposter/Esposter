interface NameStatusEntry {
  path: string;
  renamedFromPath?: string;
  status: string;
}

// Without `-z`, git prints one row per newline with fields tab-separated, and quotes a path holding a tab, a
// newline or a non-ASCII byte in C-style escapes instead of the literal bytes — a tab-splitting regex then reads
// the quote marks and escape sequences as part of the path. `-z` NUL-terminates every field of every row instead,
// so the whole output is one flat token stream with no quoting to undo: a rename row is three tokens (status, the
// path it moved from, the path it moved to), every other status is two (status, path).
export const getNameStatusEntries = (nameStatus: string): NameStatusEntry[] => {
  const tokens = nameStatus.split("\0").filter((token) => token !== "");
  const entries: NameStatusEntry[] = [];
  let index = 0;
  while (index < tokens.length) {
    const status = tokens[index];
    const path = tokens[index + 1];
    if (status === undefined || path === undefined) break;
    if (status.startsWith("R")) {
      const renamedFromPath = path;
      const newPath = tokens[index + 2];
      if (newPath === undefined) break;
      entries.push({ path: newPath, renamedFromPath, status });
      index += 3;
    } else {
      entries.push({ path, status });
      index += 2;
    }
  }
  return entries;
};
