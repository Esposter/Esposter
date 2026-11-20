import { dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { createSaveInputSchema } from "#shared/services/blobState/createSaveInputSchema";

export const saveDungeonsInputSchema = createSaveInputSchema(dungeonsSchema);
