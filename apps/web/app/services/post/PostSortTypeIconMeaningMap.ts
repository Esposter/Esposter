import { PostSortType } from "#shared/models/post/PostSortType";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

export const PostSortTypeIconMeaningMap = {
  [PostSortType.Hot]: UiIconMeaning.Hot,
  [PostSortType.New]: UiIconMeaning.New,
  [PostSortType.Old]: UiIconMeaning.Old,
  [PostSortType.Top]: UiIconMeaning.Top,
} as const satisfies Record<PostSortType, UiIconMeaning>;
