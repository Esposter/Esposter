// A value written into SVG text or a quoted attribute, with each character that would open markup escaped to the entity that stands for it
export const escapeSvgValue = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
