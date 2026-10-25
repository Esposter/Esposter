import type { AvatarArray } from "#src/models/genshinAssets/avatar/AvatarArray";
import type { AvatarView } from "genshin-world/sceneExport";

export interface AvatarBinary {
  add: (array: AvatarArray) => AvatarView;
  toBuffer: () => Buffer;
}
