// Oldest first; a caller wanting newest first swaps the arguments rather than negating the result, since a
// Negated zero still sorts as equal either way.
export const compareCreatedAt = <TEntity extends { createdAt: Date }>(first: TEntity, second: TEntity): number =>
  first.createdAt.getTime() - second.createdAt.getTime();
