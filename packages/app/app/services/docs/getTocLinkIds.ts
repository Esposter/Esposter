import type { TocLink } from "@nuxt/content";

// Flattened depth-first, so the ids come back in the order the headings appear in the page — which is the order
// The scrollspy reads them in, and the order the table of contents renders them in
export const getTocLinkIds = (links: TocLink[]): string[] =>
  links.flatMap((link) => [link.id, ...(link.children ? getTocLinkIds(link.children) : [])]);
