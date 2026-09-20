const XML_ESCAPE_REGEX = /[<>&"']/gu;
const XML_ENTITY_MAP: Record<string, string> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};

export const escapeXml = (text: string): string =>
  text.replace(XML_ESCAPE_REGEX, (character) => XML_ENTITY_MAP[character] ?? character);
