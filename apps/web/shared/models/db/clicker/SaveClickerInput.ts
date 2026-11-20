import { clickerSaveSchema } from "#shared/models/clicker/data/ClickerSave";
import { createSaveInputSchema } from "#shared/services/blobState/createSaveInputSchema";

export const saveClickerInputSchema = createSaveInputSchema(clickerSaveSchema);
