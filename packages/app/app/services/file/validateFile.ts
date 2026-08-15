import type { ValidateFileResult } from "@/models/file/ValidateFileResult";
import type { FileEntity } from "@esposter/db-schema";

import { MAX_FILE_REQUEST_SIZE } from "#shared/services/app/constants";
import { EMPTY_FILE_MESSAGE } from "@/services/file/constants";
import { getFileSize } from "@/services/file/getFileSize";
import { fileEntitySchema } from "@esposter/db-schema";

// The single client-side file validator — callers pass a tighter maxSize (e.g. a per-room limit) to narrow it.
export const validateFile = (size: FileEntity["size"], maxSize = MAX_FILE_REQUEST_SIZE): ValidateFileResult => {
  if (!fileEntitySchema.shape.size.safeParse(size).success) return { isValid: false, message: EMPTY_FILE_MESSAGE };
  // A room limit is stored in bytes and need not be a whole number of megabytes, so the message renders it
  // In whichever magnitude describes it
  else if (size > maxSize)
    return { isValid: false, message: `You can only upload files up to ${getFileSize(maxSize)}!` };
  else return { isValid: true };
};
