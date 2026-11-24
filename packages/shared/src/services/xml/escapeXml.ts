// The characters XML reads as markup, each written as the entity that stands for it, in text and in a quoted
// Attribute alike. Nothing else is escaped: XML has no entity for a no-break space, so the HTML one escapeText writes
// Is undefined to a reader
export const escapeXml = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
