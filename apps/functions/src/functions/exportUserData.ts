import type { EventGridHandler } from "@azure/functions";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { logAndRethrow } from "#src/services/shared/logAndRethrow";
import { app } from "@azure/functions";
import { AzureFunction, exportUserDataEventGridDataSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The archive build a published ExportUserData event starts. The event names the export row.
// The handler marks a failed build on the row.
// So only a failure before that point, such as a database write, is rethrown for Event Grid to redeliver.
const exportUserDataEventHandler: EventGridHandler = (event, context) =>
  getResultAsync(async () => {
    context.log(`${AzureFunction.ExportUserData} started`);
    await exportUserDataHandler(context, exportUserDataEventGridDataSchema.parse(event.data));
    context.log(`${AzureFunction.ExportUserData} finished`);
  }).match(noop, logAndRethrow(context, AzureFunction.ExportUserData));

app.eventGrid(AzureFunction.ExportUserData, { handler: exportUserDataEventHandler });

export default {};
