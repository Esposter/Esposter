import type { PublicUser } from "#src/models/user/PublicUser";
import type { LikeInPost } from "#src/schema/post/likesInPost";
import type { PostInPost } from "#src/schema/post/postsInPost";

// The likes relation is only a server-side fetch strategy filtered to the viewer's row,
// So every procedure returns at most one like — the viewer's — instead of all of them
export type PostInPostWithRelations = PostInPost & { user: PublicUser; viewerLike?: LikeInPost };
