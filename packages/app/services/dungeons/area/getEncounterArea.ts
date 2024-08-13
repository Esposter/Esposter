import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";

import { encounterAreas } from "@/assets/dungeons/data/encounterAreas";
import { NotFoundError } from "@esposter/shared";

export const getEncounterArea = (area: Area) => {
  const encounterArea = encounterAreas.find((a) => a.id === area);
  if (!encounterArea) throw new NotFoundError(getEncounterArea.name, area);
  return encounterArea;
};
