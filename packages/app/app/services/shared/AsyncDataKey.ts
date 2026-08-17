import type { PostSortType } from "@/models/post/PostSortType";
import type { Post, Resource, ResourceType, User } from "@esposter/db-schema";

import { DatabaseEntityType, DerivedDatabaseEntityType } from "@esposter/db-schema";
import { ID_SEPARATOR, Operation } from "@esposter/shared";

// Central registry for every nuxt payload key (RoutePath-style) so keys can never overlap. The keys live for
// One render, so they are composed from the enums that name what was read rather than a spelling of their own.
export const AsyncDataKey = {
  DocsNavigation: "docs-navigation",
  DocsPage: (path: string) => `docs-page${ID_SEPARATOR}${path}`,
  DocsSearchSections: "docs-search-sections",
  ReadComments: (postId: Post["id"]) =>
    `${Operation.Read}${ID_SEPARATOR}${DerivedDatabaseEntityType.Comment}${ID_SEPARATOR}${postId}`,
  // The sort and the profile both change which page the server rendered, so both are part of the key
  ReadPosts: (sortType: PostSortType, userId?: User["id"]) =>
    `${Operation.Read}${ID_SEPARATOR}${DatabaseEntityType.Post}${ID_SEPARATOR}${sortType}${userId ? `${ID_SEPARATOR}${userId}` : ""}`,
  ReadPublishedResourceContent: (type: ResourceType, id: Resource["id"], version?: number) =>
    `${Operation.Read}${ID_SEPARATOR}${DatabaseEntityType.ResourcePublication}${ID_SEPARATOR}${type}${ID_SEPARATOR}${id}${version ? `${ID_SEPARATOR}${version}` : ""}`,
} as const;
