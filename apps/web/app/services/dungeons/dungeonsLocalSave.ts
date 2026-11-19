import { dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";

// The guest's dungeons save: the key it is kept under in this browser and the schema it is read and written by. The
// Store writes it and the reader reads it, so both take the pair from here
export const dungeonsLocalSave = { key: LocalStorageKey.DungeonsStore, schema: dungeonsSchema };
