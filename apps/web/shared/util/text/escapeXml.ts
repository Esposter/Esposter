// The characters an XML text node or an SVG style sheet reads as markup, escaped to the entities that stand for them
export const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
