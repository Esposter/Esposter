export const processItem = (
  processors: ((value: string, name: string) => string)[],
  item: string,
  key: string,
): string => {
  let processedItem = item;
  for (const processor of processors) processedItem = processor(processedItem, key);
  return processedItem;
};
