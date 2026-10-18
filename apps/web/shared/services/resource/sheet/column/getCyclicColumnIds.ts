// Tarjan's strongly connected components: a column is cyclic when its component holds more than one column or it
// Sources itself. A path-marking walk misses a column that reaches a cycle through one it has already finished
export const getCyclicColumnIds = (sourceIdsMap: Map<string, string[]>) => {
  const cyclicColumnIds = new Set<string>();
  const indexMap = new Map<string, number>();
  const componentStack: string[] = [];
  const onStackIds = new Set<string>();
  // Returns the lowest index reachable from the column, which its caller folds into its own
  const visit = (columnId: string): number => {
    const index = indexMap.size;
    indexMap.set(columnId, index);
    componentStack.push(columnId);
    onStackIds.add(columnId);
    let lowLink = index;
    for (const sourceId of sourceIdsMap.get(columnId) ?? []) {
      const sourceIndex = indexMap.get(sourceId);
      if (sourceIndex === undefined) lowLink = Math.min(lowLink, visit(sourceId));
      else if (onStackIds.has(sourceId)) lowLink = Math.min(lowLink, sourceIndex);
    }
    if (lowLink === index) {
      const componentIds = new Set<string>();
      for (let memberId = componentStack.pop(); memberId !== undefined; memberId = componentStack.pop()) {
        onStackIds.delete(memberId);
        componentIds.add(memberId);
        if (memberId === columnId) break;
      }
      if (componentIds.size > 1 || sourceIdsMap.get(columnId)?.includes(columnId))
        for (const memberId of componentIds) cyclicColumnIds.add(memberId);
    }
    return lowLink;
  };
  for (const columnId of sourceIdsMap.keys()) if (!indexMap.has(columnId)) visit(columnId);
  return cyclicColumnIds;
};
