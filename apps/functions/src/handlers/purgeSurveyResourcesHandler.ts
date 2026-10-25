import type { EventGridHandler } from "@azure/functions";

import { purgeSurveyResources } from "#src/services/resource/purgeSurveyResources";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The one-time run before the survey type is removed, started by publishing one PurgeSurveyResources event to the
// Application topic in each environment. Nothing schedules it: running it is the owner's decision.
export const purgeSurveyResourcesHandler: EventGridHandler = (_event, context) =>
  getResultAsync(async () => {
    context.log(`${AzureFunction.PurgeSurveyResources} started`);
    await purgeSurveyResources(context);
    context.log(`${AzureFunction.PurgeSurveyResources} finished`);
  }).match(noop, logAndRethrow(context, AzureFunction.PurgeSurveyResources));
