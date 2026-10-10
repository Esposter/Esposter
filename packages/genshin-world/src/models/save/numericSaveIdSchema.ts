import { MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { z } from "zod";

// A record's key holding a positive id, which the save is read back by as a number: the id's own decimal, with no sign or
// Leading zero and within the safe integers, so no two keys of one record read back as the same id
export const numericSaveIdSchema = z
  .string()
  .max(MAX_SAVE_ID_LENGTH)
  .refine((id) => {
    const number = Number(id);
    return Number.isSafeInteger(number) && number > 0 && String(number) === id;
  }, "Not an id's own decimal");
