import type { EventGridHandler } from "@azure/functions";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { app } from "@azure/functions";
import { AzureFunction, deleteAccountEventGridDataSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The sweep a published DeleteAccount event starts. The event names the account and the handler runs every step
// In order, so a step that fails fails the invocation and Event Grid redelivers the event for the steps left.
const deleteAccountEventHandler: EventGridHandler = (event, context) =>
  getResultAsync(async () => {
    context.log(`${AzureFunction.DeleteAccount} started`);
    const { userId } = deleteAccountEventGridDataSchema.parse(event.data);
    await deleteAccountHandler(context, userId);
    context.log(`${AzureFunction.DeleteAccount} finished`);
  }).match(noop, logAndRethrow(context, AzureFunction.DeleteAccount));

app.eventGrid(AzureFunction.DeleteAccount, { handler: deleteAccountEventHandler });

export default {};
