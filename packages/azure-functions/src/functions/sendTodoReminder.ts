import { sendTodoReminderHandler } from "@/handlers/sendTodoReminderHandler";
import { ProcessProperties } from "@/services/process";
import { app } from "@azure/functions";
import { AzureFunction, AzureQueue } from "@esposter/db-schema";

app.serviceBusQueue(AzureFunction.SendTodoReminder, {
  connection: ProcessProperties.AZURE_SERVICE_BUS_CONNECTION_STRING,
  handler: sendTodoReminderHandler,
  queueName: AzureQueue.TodoReminders,
});

export default {};
