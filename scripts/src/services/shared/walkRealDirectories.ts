// Every item the roots reach, each once: two items are one when their directories are, so a package two branches reach
// Is walked once. The items come back in the order they are first reached, which leads with the roots
export const walkRealDirectories = <T>(
  roots: T[],
  getDirectory: (item: T) => string,
  getNeighbours: (item: T) => T[],
): T[] => {
  const walkedDirectories = new Set<string>();
  const pending = [...roots];
  const walked: T[] = [];
  for (const item of pending) {
    const directory = getDirectory(item);
    if (walkedDirectories.has(directory)) continue;

    walkedDirectories.add(directory);
    walked.push(item);
    pending.push(...getNeighbours(item));
  }
  return walked;
};
