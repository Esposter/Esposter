import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

// The guest's clicker save: the key it is kept under in this browser and the schema it is read and written by. The
// Store writes it and the reader reads it, so both take the pair from here
export const clickerLocalSave = { key: LocalStorageKey.ClickerStore, schema: clickerSaveSchema };
