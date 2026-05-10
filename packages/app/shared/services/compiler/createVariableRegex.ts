export const createVariableRegex = (openDelimiter: string, closeDelimiter: string): RegExp => {
  const escapedOpen = openDelimiter.replaceAll(new RegExp(String.raw`[.*+?^{}$()|[\]\\]`, "gu"), String.raw`\$&`);
  const escapedClose = closeDelimiter.replaceAll(new RegExp(String.raw`[.*+?^{}$()|[\]\\]`, "gu"), String.raw`\$&`);
  return new RegExp(`${escapedOpen}([\\s\\S]+?)${escapedClose}`, "gu");
};
