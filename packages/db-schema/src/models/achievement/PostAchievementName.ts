export const PostAchievementName = {
  BriefComment: "BriefComment",
  Commentator: "Commentator",
  CommentDeleter: "CommentDeleter",
  CommentEditor: "CommentEditor",
  DetailedPost: "DetailedPost",
  Novelist: "Novelist",
  PostDeleter: "PostDeleter",
  PostEditor: "PostEditor",
  PosterChild: "PosterChild",
  ProlificPoster: "ProlificPoster",
} as const;
export type PostAchievementName = (typeof PostAchievementName)[keyof typeof PostAchievementName];
