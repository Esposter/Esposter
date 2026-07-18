import type { Resource, ResourceType } from "@esposter/db-schema";

// Central registry for every useAsyncData key (RoutePath-style) so keys can never overlap.
export const AsyncDataKey = {
  DocsNavigation: "docs-navigation",
  DocsPage: (path: string) => `docs-page:${path}`,
  DocsSearchSections: "docs-search-sections",
  ReadPublishedResourceContent: (type: ResourceType, id: Resource["id"], version?: number) =>
    `read-published-resource-content:${type}:${id}${version ? `:${version}` : ""}`,
} as const;
