import type { FileEntity } from "#shared/models/azure/FileEntity";

import { fileEntitySchema } from "#shared/models/azure/FileEntity";

export const validateFile = (size: FileEntity["size"]) => fileEntitySchema.shape.size.safeParse(size).success;
