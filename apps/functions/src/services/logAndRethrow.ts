import type { InvocationContext } from "@azure/functions";
import type { AzureFunction } from "@esposter/db-schema";

import { AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX } from "@esposter/db-schema";

export const logAndRethrow =
  (context: InvocationContext, azureFunction: AzureFunction) =>
  (error: Error): never => {
    context.error(`${azureFunction}${AZURE_FUNCTION_FAILED_LOG_MESSAGE_SUFFIX}`, error);
    throw error;
  };
