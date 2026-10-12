// The scene exports' entry for the app's server, which serves the developer's own exports of the game's scenes in the
// Layout the world reads them by. Only the layout's own names are reached from here, so the server never loads the
// World's components
export type { AvatarBone } from "#src/models/avatar/AvatarBone";
export type { AvatarManifest } from "#src/models/avatar/AvatarManifest";
export type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
export type { AvatarMesh } from "#src/models/avatar/AvatarMesh";
export type { AvatarSubmesh } from "#src/models/avatar/AvatarSubmesh";
export type { AvatarView } from "#src/models/avatar/AvatarView";
export {
  AVATAR_BINARY_FILE_NAME,
  AVATAR_MANIFEST_FILE_NAME,
  SCENE_EXPORT_INDEX_PATH,
  WITNESS_LAYOUT_FILE_NAME,
} from "#src/services/scene/constants";
