// The typed arrays of a manifest's views, packed into one binary, each starting on a four-byte boundary so every view
// Is a typed array over the buffer the world reads it from without a copy
export type AvatarArray = Float32Array | Uint16Array | Uint32Array;
