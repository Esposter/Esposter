// Central registry for every useAsyncData key (RoutePath-style) so keys can never overlap.
export const AsyncDataKey = {
  DocsNavigation: "docs-navigation",
  DocsPage: (path: string) => `docs-page:${path}`,
  DocsSurround: (path: string) => `docs-surround:${path}`,
} as const;
