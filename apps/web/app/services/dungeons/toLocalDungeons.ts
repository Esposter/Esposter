import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { jsonDateParse } from "@esposter/shared";

// A corrupt or outdated local save falls back to a fresh game, as the clicker's does, rather than throwing on load
export const toLocalDungeons = (dungeonsJson: string | null) => {
  if (!dungeonsJson) return new Dungeons();

  try {
    const parsedDungeons = dungeonsSchema.safeParse(jsonDateParse(dungeonsJson));
    return parsedDungeons.success ? new Dungeons(parsedDungeons.data) : new Dungeons();
  } catch {
    return new Dungeons();
  }
};
