import type { TimerHandler } from "@azure/functions";

import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// Everything the Recycle bin held past its window is destroyed here, by the same purge a one-time run drives
export const purgeDeletedResourcesHandler: TimerHandler = (_timer, context) =>
  getResultAsync(() => purgeExpiredResources(context)).match(
    noop,
    logAndRethrow(context, AzureFunction.PurgeDeletedResources),
  );
