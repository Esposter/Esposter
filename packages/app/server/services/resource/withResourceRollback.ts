import type { AuthedContext } from "@@/server/models/auth/AuthedContext";

import { deleteCreatedResources } from "@@/server/services/resource/deleteCreatedResources";
import { getResultAsync, noop } from "@esposter/shared";

// Every path that creates resource rows before writing their content owes the same compensation: a failure
// Anywhere after the row exists must not leave a row whose content never landed. `createdIds` is read when
// The rollback runs rather than when the call is made, so a loop may keep pushing into the array it passed
export const withResourceRollback = (
  ctx: AuthedContext,
  createdIds: string[],
  operation: () => Promise<void>,
): Promise<void> =>
  getResultAsync(operation).match(noop, async (error) => {
    await deleteCreatedResources(ctx, createdIds);
    throw error;
  });
