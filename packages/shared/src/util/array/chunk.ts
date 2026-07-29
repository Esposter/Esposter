export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < array.length; index += size) chunks.push(array.slice(index, index + size));
  return chunks;
};
