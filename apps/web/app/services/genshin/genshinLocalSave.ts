import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { genshinSaveSchema } from "genshin-world/save";

// The Genshin save a signed-out player plays: the key it is kept under in this browser and the schema it is read and
// Written by. The save writes and clears it, and the guest reader reads it, so both take the pair from here
export const genshinLocalSave = { key: LocalStorageKey.GenshinSave, schema: genshinSaveSchema };
