import { encounterAreas } from "@/assets/dungeons/data/encounterAreas";
import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import { NotFoundError } from "@esposter/shared/models/error/NotFoundError";

export const getEncounterArea = (area: Area) => {
  const encounterArea = encounterAreas.find((a) => a.id === area);
  if (!encounterArea) throw new NotFoundError(getEncounterArea.name, area);
  return encounterArea;
};
