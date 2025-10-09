import type { FileEntity } from "@esposter/shared";

import { fileEntitySchema } from "@esposter/shared";

export const validateFile = (size: FileEntity["size"]) => fileEntitySchema.shape.size.safeParse(size).success;
