import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { dungeonsLocalSave } from "#src/services/dungeons/dungeonsLocalSave";
import { parseJsonWithSchema } from "#src/services/shared/parseJsonWithSchema";

// A corrupt or outdated local save falls back to a fresh game, as the clicker's does, rather than throwing on load
export const toLocalDungeons = (dungeonsJson: null | string) => {
  const savedDungeons = dungeonsJson ? parseJsonWithSchema(dungeonsJson, dungeonsLocalSave.schema) : undefined;
  return savedDungeons ? new Dungeons(savedDungeons) : new Dungeons();
};
