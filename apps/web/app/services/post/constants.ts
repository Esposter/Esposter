import { PostSortType } from "#shared/models/post/PostSortType";

export const MAX_COMMENT_INDENT_DEPTH = 6;
// As many post cards as the feed draws while it reads, about a screen of them
export const POST_SKELETON_COUNT = 3;
// The comment sort menu lists Hot, Top, New and Old, which is not the enum's sorted order
export const POST_SORT_TYPES: PostSortType[] = [PostSortType.Hot, PostSortType.Top, PostSortType.New, PostSortType.Old];
// Old orders a thread only, so the feed's Sort by offers the rest
export const POST_FEED_SORT_TYPES: PostSortType[] = [PostSortType.Hot, PostSortType.New, PostSortType.Top];
