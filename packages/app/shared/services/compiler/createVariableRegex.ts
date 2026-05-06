export const createVariableRegex = (openDelimiter: string, closeDelimiter: string): RegExp => {
  const escapedOpen = openDelimiter.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
  const escapedClose = closeDelimiter.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);
  return new RegExp(`${escapedOpen}([\\s\\S]+?)${escapedClose}`, "g");
};
