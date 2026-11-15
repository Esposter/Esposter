// The kind of a likes entry in the archive: a like or dislike of a post, or an emoji reaction on a room message
export const ArchiveLikeKind = { Emoji: "emoji", Post: "post" } as const;
export type ArchiveLikeKind = (typeof ArchiveLikeKind)[keyof typeof ArchiveLikeKind];
