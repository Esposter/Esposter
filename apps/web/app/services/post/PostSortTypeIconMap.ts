import { PostSortType } from "@/models/post/PostSortType";

export const PostSortTypeIconMap = {
  [PostSortType.Hot]: "mdi-fire",
  [PostSortType.New]: "mdi-clock-outline",
  [PostSortType.Top]: "mdi-poll",
} as const satisfies Record<PostSortType, string>;
