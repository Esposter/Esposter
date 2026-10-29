// A quoted `filename` cannot hold a quote, a backslash or a line break, so a name carrying one ends the parameter early.
// RFC 5987's UTF-8 form carries any name whole, with every character outside its attribute set percent-encoded
export const getAttachmentContentDisposition = (filename: string) =>
  `attachment; filename*=UTF-8''${encodeURIComponent(filename).replaceAll(/['()*]/gu, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)}`;
