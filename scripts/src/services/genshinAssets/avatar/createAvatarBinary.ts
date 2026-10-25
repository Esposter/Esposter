import type { AvatarBinary } from "#src/models/genshinAssets/avatar/AvatarBinary";
import type { AvatarView } from "genshin-world/sceneExport";

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
