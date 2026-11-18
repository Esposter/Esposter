// The names a wiki page links to, each once in the order the page gives them. A family page lists its variants as links,
// Its gallery and its drops sections among them, and names that are no monster are filtered out by the caller
export const toWikiPageVariants = (content: string): string[] => {
  const targets = Array.from(content.matchAll(/\[\[(?<target>[^[\]|#]+)/gu), (match) =>
    (match.groups?.target ?? "").trim(),
  );
  return [...new Set(targets)];
};
