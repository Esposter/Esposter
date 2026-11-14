import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { PostInPost } from "@esposter/db-schema";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { ID_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { PostSortType } from "@/models/post/PostSortType";

// Every sort ends on the unique id so cursor pagination never skips tied rows, and the creation sorts are the id alone
export const PostSortTypeSortByMap = {
  [PostSortType.Hot]: [
    { key: "ranking", order: SortOrder.Desc },
    { key: "id", order: SortOrder.Desc },
  ],
  [PostSortType.New]: [ID_DESCENDING_SORT_ITEM],
  [PostSortType.Old]: [{ key: "id", order: SortOrder.Asc }],
  [PostSortType.Top]: [
    { key: "likeCount", order: SortOrder.Desc },
    { key: "id", order: SortOrder.Desc },
  ],
} satisfies Record<PostSortType, SortItem<keyof PostInPost>[]>;
