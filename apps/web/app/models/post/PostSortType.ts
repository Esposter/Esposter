export enum PostSortType {
  Hot = "Hot",
  Top = "Top",
  New = "New",
  Old = "Old",
}

export const PostSortTypes = Object.values(PostSortType);
// Old orders a thread only, so the feed's Sort by offers the rest
export const PostFeedSortTypes = [PostSortType.Hot, PostSortType.New, PostSortType.Top];
