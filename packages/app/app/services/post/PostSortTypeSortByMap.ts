import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { Post } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { PostSortType } from "@/models/post/PostSortType";

// Every sort carries the unique id as tiebreaker so cursor pagination never skips tied rows
export const PostSortTypeSortByMap = {
  [PostSortType.Hot]: [
    { key: "ranking", order: SortOrder.Desc },
    { key: "id", order: SortOrder.Desc },
  ],
  [PostSortType.New]: [
    { key: "createdAt", order: SortOrder.Desc },
    { key: "id", order: SortOrder.Desc },
  ],
  [PostSortType.Top]: [
    { key: "noLikes", order: SortOrder.Desc },
    { key: "id", order: SortOrder.Desc },
  ],
} satisfies Record<PostSortType, SortItem<keyof Post>[]>;
