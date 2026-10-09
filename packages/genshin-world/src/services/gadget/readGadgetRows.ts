import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { gadgetRowSchema } from "#src/models/gadget/GadgetRow";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The gadgets the widget config gives `pnpm -C scripts genshin:assets gadgets` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readGadgetRows = (gameDataBaseUrl: string): Promise<GadgetRow[]> =>
  readGameData(gameDataBaseUrl, "gadgets/gadgets", z.array(gadgetRowSchema));
