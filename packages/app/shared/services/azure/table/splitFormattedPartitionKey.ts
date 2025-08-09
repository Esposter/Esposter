export const splitFormattedPartitionKey = (partitionKey: string): [string, string] => {
  const [firstIndex, secondIndex] = partitionKey.split("-");
  return [firstIndex, secondIndex];
};
