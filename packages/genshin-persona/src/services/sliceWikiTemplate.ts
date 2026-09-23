const TEMPLATE_END = "\n}}";
// The one voice-over template a page's lines are read from, whole; a page without it holds no lines
export const sliceWikiTemplate = (wikitext: string, start: string): string => {
  const startIndex = wikitext.indexOf(start);
  if (startIndex === -1) return "";

  const endIndex = wikitext.indexOf(TEMPLATE_END, startIndex);
  return wikitext.slice(startIndex, endIndex === -1 ? undefined : endIndex);
};
