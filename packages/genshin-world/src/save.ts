// The save's entry for the app's server, which validates what it stores and starts a new player's save. Only the save's
// Own modules are reached from here, so the server never loads the world's components
export { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
export type { GenshinSave } from "#src/models/save/GenshinSave";
export { genshinSaveSchema } from "#src/models/save/GenshinSave";
