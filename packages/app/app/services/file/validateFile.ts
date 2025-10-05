import type { FileEntity } from "#shared/models/azure/table/FileEntity";

import { fileEntitySchema } from "#shared/models/azure/table/FileEntity";

export const validateFile = (size: FileEntity["size"]) => fileEntitySchema.shape.size.safeParse(size).success;
