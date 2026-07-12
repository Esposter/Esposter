// Splits a row title around the first case-insensitive occurrence of the query for match highlighting;
// Returns undefined when there is nothing to highlight so callers render the plain title
export const getHighlightParts = (text: string, searchQuery: string) => {
  if (!searchQuery) return undefined;
  const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
  if (index === -1) return undefined;
  return {
    match: text.slice(index, index + searchQuery.length),
    prefix: text.slice(0, index),
    suffix: text.slice(index + searchQuery.length),
  };
};
