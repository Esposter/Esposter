import type { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";

import { getById } from "#shared/services/dungeons/getById";
import { encounterAreas } from "@/assets/dungeons/data/encounterAreas";

export const getEncounterArea = (area: Area) => getById(encounterAreas, area, getEncounterArea.name);
