export enum PostSortType {
  Hot = "Hot",
  New = "New",
  Old = "Old",
  Top = "Top",
}
// The comment sort menu lists Hot, Top, New and Old, which is not the enum's sorted order
export const PostSortTypes = [PostSortType.Hot, PostSortType.Top, PostSortType.New, PostSortType.Old];
// Old orders a thread only, so the feed's Sort by offers the rest
export const PostFeedSortTypes = [PostSortType.Hot, PostSortType.New, PostSortType.Top];
