import type { PostSortType } from "@/models/post/PostSortType";

import { PostSortTypeIconMeaningMap } from "@/services/post/PostSortTypeIconMeaningMap";

// The options of a Sort by select over the given sorts, each drawn with its own mark
export const getPostSortTypeItems = (postSortTypes: PostSortType[]) =>
  postSortTypes.map((postSortType) => ({
    meaning: PostSortTypeIconMeaningMap[postSortType],
    title: postSortType,
    value: postSortType,
  }));
