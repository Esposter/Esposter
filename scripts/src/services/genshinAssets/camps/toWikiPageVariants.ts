// The names a wiki page lists, each once in the order the page gives them: the pages it links to, and the enemies its
// Cards name. A family page lists its variants as links, its gallery and its drops sections among them, and a type page
// Such as the Normal Boss page lists its enemies as cards. A name that is no monster is filtered out by the caller
export const toWikiPageVariants = (content: string): string[] => {
  const linkTargets = Array.from(content.matchAll(/\[\[(?<target>[^[\]|#]+)/gu), (match) =>
    (match.groups?.target ?? "").trim(),
  );
  const cardNames = Array.from(content.matchAll(/\{\{Card\|(?<name>[^|}]+)\|type=Enemy/gu), (match) =>
    (match.groups?.name ?? "").trim(),
  );
  return [...new Set([...linkTargets, ...cardNames])];
};
