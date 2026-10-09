import { checkIsConflict } from "#src/services/azure/error/checkIsConflict";
import { checkIsPreconditionFailed } from "#src/services/azure/error/checkIsPreconditionFailed";

// Already stored under its own address, by an identical write's twin. A single-shot upload violates `If-None-Match: *`
// As 409 (Put Blob's own special case for it), while a block list large enough to stage and commit separately violates
// It as the generic 412 every other conditional write uses, so both answers mean the object is already there
export const checkIsAlreadyStored = (error: unknown): boolean =>
  checkIsConflict(error) || checkIsPreconditionFailed(error);
