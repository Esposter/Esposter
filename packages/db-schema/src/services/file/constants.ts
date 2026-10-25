// RFC 6838 caps a type and a subtype at 127 characters each, either side of the slash
export const MIMETYPE_MAX_LENGTH = 255;
export const THUMBNAIL_CONTENT_TYPE = "image/webp";
// The longest edge the composer scales a thumbnail to, which is the encoder's input bound
export const THUMBNAIL_MAX_EDGE = 320;
// The bytes a thumbnail reserves before its `BlobCreated` lands. The client encodes a lossy WebP at its own quality, and
// The raw RGBA of a max-edge square is a ceiling no such encode reaches, so the reserve never undershoots and the
// Reconcile replaces it with the stored size
export const MAX_THUMBNAIL_BYTES = THUMBNAIL_MAX_EDGE * THUMBNAIL_MAX_EDGE * 4;
