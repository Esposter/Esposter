import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toGenshinSave } from "#src/services/save/toGenshinSave";

// The systems as the save holds them, emitted on every change at once, so a grant's emit after its change carries it. Read
// Through a getter, so it is made last, once every system it reads exists
export const useWorldSaveSync = ({
  emitSave,
  getSaveState,
}: {
  emitSave: (save: GenshinSave) => void;
  getSaveState: () => GenshinSaveState;
}) => {
  const gameSave = computed(() => toGenshinSave(getSaveState()));
  watch(gameSave, (newGameSave) => emitSave(newGameSave), { flush: "sync" });
};
