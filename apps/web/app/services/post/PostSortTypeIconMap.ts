// @unocss-include
import { PostSortType } from "@/models/post/PostSortType";

export const PostSortTypeIconMap = {
  [PostSortType.Hot]: "i-mdi:fire",
  [PostSortType.New]: "i-mdi:clock-outline",
  [PostSortType.Top]: "i-mdi:poll",
} as const satisfies Record<PostSortType, string>;
