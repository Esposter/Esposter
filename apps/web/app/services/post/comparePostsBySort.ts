import type { PostSortType } from "#shared/models/post/PostSortType";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { PostSortTypePageSortMap } from "#shared/services/post/PostSortTypePageSortMap";
import { SortOrder } from "@esposter/db-schema";
import { compareText } from "@esposter/shared";

// The order a feed's sort names: its keys compare in turn, and the first that differs decides, every key in the sort's
// Own direction. The id is text and compares by bytes, as the server's index does, and the other keys are numbers
export const comparePostsBySort = (
  sortType: PostSortType,
  firstPost: Pick<PostInPostWithRelations, "id" | "likeCount" | "ranking">,
  secondPost: Pick<PostInPostWithRelations, "id" | "likeCount" | "ranking">,
): number => {
  const { keys, order } = PostSortTypePageSortMap[sortType];
  const direction = order === SortOrder.Desc ? -1 : 1;
  for (const key of keys) {
    const difference = key === "id" ? compareText(firstPost.id, secondPost.id) : firstPost[key] - secondPost[key];
    if (difference !== 0) return direction * difference;
  }
  return 0;
};
