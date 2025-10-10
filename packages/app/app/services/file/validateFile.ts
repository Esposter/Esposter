import type { FileEntity } from "@esposter/db";

import { fileEntitySchema } from "@esposter/db";

export const validateFile = (size: FileEntity["size"]) => fileEntitySchema.shape.size.safeParse(size).success;
