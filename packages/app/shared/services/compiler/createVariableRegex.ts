export const createVariableRegex = (openDelimiter: string, closeDelimiter: string): RegExp => {
  const escapedOpen = openDelimiter.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedClose = closeDelimiter.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escapedOpen}([^${escapedClose}]+)${escapedClose}`, "g");
};
