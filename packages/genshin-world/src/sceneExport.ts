// The scene exports' entry for the app's server, which serves the developer's own exports of the game's scenes in the
// Layout the world reads them by. Only the layout's own names are reached from here, so the server never loads the
// World's components
export { SCENE_EXPORT_INDEX_PATH, WITNESS_LAYOUT_FILE_NAME } from "#src/services/scene/constants";
