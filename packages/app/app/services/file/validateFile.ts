import type { ValidateFileResult } from "@/models/file/ValidateFileResult";
import type { FileEntity } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE, MEGABYTE } from "#shared/services/app/constants";
import { fileEntitySchema } from "@esposter/db-schema";

// The single client-side file validator — callers pass a tighter maxSize (e.g. a per-room limit) to narrow it.
export const validateFile = (size: FileEntity["size"], maxSize = MAX_FILE_REQUEST_SIZE): ValidateFileResult => {
  if (!fileEntitySchema.shape.size.safeParse(size).success)
    return { isValid: false, message: "You can only upload non-empty files!" };
  else if (size > maxSize)
    return { isValid: false, message: `You can only upload files up to ${maxSize / MEGABYTE} MB!` };
  else return { isValid: true };
};
