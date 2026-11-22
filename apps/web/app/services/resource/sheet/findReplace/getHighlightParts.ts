// The text cut at each occurrence of the search, every part flagged as a match or not, so a highlight can wrap the matches
export const getHighlightParts = (text: string, search: string): { isMatch: boolean; text: string }[] => {
  if (!search) return [{ isMatch: false, text }];
  const highlightParts: { isMatch: boolean; text: string }[] = [];
  let remaining = text;
  let index = remaining.indexOf(search);
  while (index !== -1) {
    if (index > 0) highlightParts.push({ isMatch: false, text: remaining.slice(0, index) });
    highlightParts.push({ isMatch: true, text: search });
    remaining = remaining.slice(index + search.length);
    index = remaining.indexOf(search);
  }
  if (remaining) highlightParts.push({ isMatch: false, text: remaining });
  return highlightParts;
};
