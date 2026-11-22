// The scene exports' entry for the app's server, which serves the developer's own exports of the game's scenes in the
// Layout the world reads them by. Only the layout's own names are reached from here, so the server never loads the
// World's components. The witness target names are the one parity model it takes, since the parity tooling reads them at run time
// And they are a plain map with no component behind them
export { WitnessTarget } from "#parity/models/witness/WitnessTarget";
export type { AvatarBone } from "#src/models/avatar/AvatarBone";
export type { AvatarManifest } from "#src/models/avatar/AvatarManifest";
export type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
export type { AvatarMesh } from "#src/models/avatar/AvatarMesh";
export type { AvatarSubmesh } from "#src/models/avatar/AvatarSubmesh";
export type { AvatarView } from "#src/models/avatar/AvatarView";
export { materialFloatSchema } from "#src/models/material/MaterialFloat";
export {
  AVATAR_BINARY_FILE_NAME,
  AVATAR_MANIFEST_FILE_NAME,
  SCENE_EXPORT_INDEX_PATH,
  SCENE_EXPORT_ROOT_FILE_NAMES,
  WITNESS_LAYOUT_FILE_NAME,
} from "#src/services/scene/constants";
export { encodeNonFiniteFloat } from "#src/services/shared/encodeNonFiniteFloat";
