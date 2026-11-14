// The five predefined entities and the numeric references S3 writes its text with, decoded in one pass so that
// `&amp;lt;` reads as `&lt;` and not as `<`. An entity it does not know is left as it was written
export const decodeXmlText = (text: string): string => {
  const predefined: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
  return text.replaceAll(/&(?<name>#x[\da-fA-F]+|#\d+|amp|apos|gt|lt|quot);/gu, (entity: string, name: string) => {
    if (name.startsWith("#x")) return String.fromCodePoint(Number.parseInt(name.slice(2), 16));
    if (name.startsWith("#")) return String.fromCodePoint(Math.trunc(Number(name.slice(1))));
    return predefined[name] ?? entity;
  });
};
