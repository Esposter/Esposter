export const createVariableRegex = (openDelimiter: string, closeDelimiter: string): RegExp => {
  const escapedOpen = RegExp.escape(openDelimiter);
  const escapedClose = RegExp.escape(closeDelimiter);
  return new RegExp(`${escapedOpen}([\\s\\S]+?)${escapedClose}`, "gu");
};
