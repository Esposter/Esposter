import { PostSortType } from "@/models/post/PostSortType";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const PostSortTypeIconMeaningMap = {
  [PostSortType.Hot]: UiIconMeaning.Hot,
  [PostSortType.New]: UiIconMeaning.New,
  [PostSortType.Top]: UiIconMeaning.Top,
} as const satisfies Record<PostSortType, UiIconMeaning>;
