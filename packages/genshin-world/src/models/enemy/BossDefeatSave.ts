import { MAX_BOSS_DEFEAT_COUNT, MAX_SAVE_ID_LENGTH, MAX_SAVE_INSTANT_LENGTH } from "#src/services/save/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// Each defeated boss's moment of defeat by its spawn key, as an ISO string on the server's clock. A boss stays down until
// Its blossom is claimed or the first teleport after this moment, so the save keeps the moment its return is read from
export const bossDefeatSaveSchema = createRecordSchema(
  z.string().min(1).max(MAX_SAVE_ID_LENGTH),
  z.iso.datetime().max(MAX_SAVE_INSTANT_LENGTH),
  MAX_BOSS_DEFEAT_COUNT,
);

export type BossDefeatSave = z.infer<typeof bossDefeatSaveSchema>;
