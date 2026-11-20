import type { PostInPost } from "@esposter/db-schema";

// The counts the server keeps on a post, which a read of the counts names by the post's id and the version the counts
// Are at. The version is the post row's, since a count moves in the same write that raises the row's version
export type PostCountFields = Pick<PostInPost, "commentCount" | "id" | "likeCount" | "version">;
