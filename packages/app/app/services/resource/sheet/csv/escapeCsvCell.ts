export const escapeCsvCell = (value: string, delimiter: string): string => {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n") || value.includes("\r"))
    return `"${value.replaceAll('"', '""')}"`;
  return value;
};
