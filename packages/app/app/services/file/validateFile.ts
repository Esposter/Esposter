import type { FileEntity } from "@esposter/db-schema";

import { fileEntitySchema } from "@esposter/db-schema";

export const validateFile = (size: FileEntity["size"]) => fileEntitySchema.shape.size.safeParse(size).success;
