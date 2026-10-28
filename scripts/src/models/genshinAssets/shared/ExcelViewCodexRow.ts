// The fields read off one row of the game's viewpoint codex: its id, its name by text hash, its order in the codex,
// Whether the codex has left it out, and the scene, group, config id and gadget that place its viewpoint
export interface ExcelViewCodexRow {
  configId: number;
  gadgetId: number;
  groupId: number;
  id: number;
  isDisuse: boolean;
  nameTextMapHash: number;
  sceneId: number;
  sortOrder: number;
}
