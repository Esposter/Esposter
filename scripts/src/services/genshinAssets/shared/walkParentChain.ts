// The chain from the topmost ancestor down to the start, found by climbing each node's parent until parentOf answers
// Undefined
export const walkParentChain = <T>(start: T | undefined, parentOf: (node: T) => T | undefined): T[] => {
  const chain: T[] = [];
  for (let node = start; node !== undefined; node = parentOf(node)) chain.unshift(node);
  return chain;
};
