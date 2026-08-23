import type { EventGridHandler, InvocationContext } from "@azure/functions";
import type { AzureFunction } from "@esposter/db-schema";
import type { z } from "zod";

import { logAndRethrow } from "#src/services/logAndRethrow";
import { getResultAsync, noop } from "@esposter/shared";

export const createEventGridNotificationHandler =
  <TData>(
    azureFunction: AzureFunction,
    schema: z.ZodType<TData>,
    send: (context: InvocationContext, data: TData) => Promise<void>,
    getSuccessMessage: (data: TData) => string,
  ): EventGridHandler =>
  (event, context) => {
    context.log(`${azureFunction} processed message: `, event.data);
    return getResultAsync(async () => {
      const data = schema.parse(event.data);
      await send(context, data);
      context.log(getSuccessMessage(data));
    }).match(noop, logAndRethrow(context, azureFunction));
  };
