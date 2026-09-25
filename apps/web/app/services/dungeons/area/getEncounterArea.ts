import type { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";

import { encounterAreas } from "@/assets/dungeons/data/encounterAreas";
import { getById } from "#shared/services/dungeons/getById";

export const getEncounterArea = (area: Area) => getById(encounterAreas, area, getEncounterArea.name);
