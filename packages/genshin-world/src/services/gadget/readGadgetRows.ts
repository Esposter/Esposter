import type { GadgetRow } from "#src/models/gadget/GadgetRow";

import { gadgetRowSchema } from "#src/models/gadget/GadgetRow";
import { z } from "zod";

// The gadgets the widget config gives, the slice `pnpm -C scripts genshin:assets gadgets` writes, imported on demand as a
// Chunk of its own and checked against its shape as it arrives
export const readGadgetRows = async (): Promise<GadgetRow[]> => {
  const { default: gadgetRows } = await import("#src/generated/gadgets/gadgets.json");
  return z.array(gadgetRowSchema).parse(gadgetRows);
};
