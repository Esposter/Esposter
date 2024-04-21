import { encounterAreas } from "@/assets/dungeons/data/encounterAreas";
import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import { NotFoundError } from "@/models/error/NotFoundError";
import { DataType } from "@/models/error/dungeons/DataType";

export const getEncounterArea = (area: Area) => {
  const encounterArea = encounterAreas.find((a) => a.id === area);
  if (!encounterArea) throw new NotFoundError(DataType.Area, area);
  return encounterArea;
};
