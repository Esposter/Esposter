import type { PageSort, PostInPost } from "@esposter/db-schema";

import { PostSortType } from "#shared/models/post/PostSortType";
import { SortOrder } from "@esposter/db-schema";

// Every sort ends on the unique id, so a page never skips tied rows. The parent's and the author's feeds are each served
// By an index that leads with the sort's own key
export const PostSortTypePageSortMap = {
  [PostSortType.Hot]: { keys: ["ranking", "id"], order: SortOrder.Desc },
  [PostSortType.New]: { keys: ["id"], order: SortOrder.Desc },
  [PostSortType.Old]: { keys: ["id"], order: SortOrder.Asc },
  [PostSortType.Top]: { keys: ["likeCount", "id"], order: SortOrder.Desc },
} as const satisfies Record<PostSortType, PageSort<keyof Pick<PostInPost, "id" | "likeCount" | "ranking">>>;
