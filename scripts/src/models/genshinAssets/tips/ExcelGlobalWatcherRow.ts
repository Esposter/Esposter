// The fields read off one row of the game's global watcher table: the watcher's id and the trigger that fires it, its
// Kind as the table spells it and the parameters it is given. The table leaves a trigger's kind out where the watcher
// Has none
export interface ExcelGlobalWatcherRow {
  id: number;
  triggerConfig?: { paramList: string[]; triggerType?: string };
}
