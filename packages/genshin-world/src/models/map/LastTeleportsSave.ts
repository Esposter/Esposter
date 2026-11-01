import { MAX_SAVE_ID_LENGTH, MAX_SAVE_INSTANT_LENGTH, MAX_TELEPORT_AREA_COUNT } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// The last teleport that landed in each area, by the area's id, and the one that landed outside every area under the empty
// Id, each as an ISO string on the server's clock
export const lastTeleportsSaveSchema = createRecordSchema(
  z.string().max(MAX_SAVE_ID_LENGTH),
  z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  MAX_TELEPORT_AREA_COUNT,
);
