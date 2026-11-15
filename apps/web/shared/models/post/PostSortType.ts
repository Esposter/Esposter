export const PostSortType = { Hot: "Hot", New: "New", Old: "Old", Top: "Top" } as const;
export type PostSortType = (typeof PostSortType)[keyof typeof PostSortType];
