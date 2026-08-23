import { sendTodoReminderHandler } from "#src/handlers/sendTodoReminderHandler";
import { ProcessProperties } from "#src/services/process";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.serviceBusQueue(AzureFunction.SendTodoReminder, {
  connection: ProcessProperties.AZURE_SERVICE_BUS_CONNECTION_STRING,
  handler: sendTodoReminderHandler,
  queueName: AzureQueue.TodoReminders,
});

export default {};
