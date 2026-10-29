import type { MapSubareaLabel } from "#src/models/map/MapSubareaLabel";

import { mapSubareaLabelSchema } from "#src/models/map/MapSubareaLabel";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The subarea labels the open world publishes, one for each outline of each level-two area the game names, fetched by
// its key from the hosted game data and checked against its schema as it arrives
export const readMapSubareaLabels = (gameDataBaseUrl: string): Promise<MapSubareaLabel[]> =>
  readGameData(gameDataBaseUrl, "mapLabels/subareas", z.array(mapSubareaLabelSchema));
