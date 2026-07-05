import type { InvocationContext } from "@azure/functions";
import type { AzureFunction } from "@esposter/db-schema";

export const logAndRethrow =
  (context: InvocationContext, azureFunction: AzureFunction) =>
  (error: Error): never => {
    context.error(`${azureFunction} failed: `, error);
    throw error;
  };
