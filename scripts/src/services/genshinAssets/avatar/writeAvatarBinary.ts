import type { AvatarView } from "genshin-world/sceneExport";

// The typed arrays of a manifest's views, packed into one binary, each starting on a four-byte boundary so every view
// Is a typed array over the buffer the world reads it from without a copy
export type AvatarArray = Float32Array | Uint16Array | Uint32Array;
export interface AvatarBinary {
  add: (array: AvatarArray) => AvatarView;
  toBuffer: () => Buffer;
}

export const createAvatarBinary = (): AvatarBinary => {
  const chunks: Buffer[] = [];
  let byteLength = 0;
  return {
    add: (array) => {
      const padding = (4 - (byteLength % 4)) % 4;
      if (padding) {
        chunks.push(Buffer.alloc(padding));
        byteLength += padding;
      }
      const view: AvatarView = { length: array.length, offset: byteLength };
      const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
      chunks.push(bytes);
      byteLength += bytes.byteLength;
      return view;
    },
    toBuffer: () => Buffer.concat(chunks, byteLength),
  };
};
