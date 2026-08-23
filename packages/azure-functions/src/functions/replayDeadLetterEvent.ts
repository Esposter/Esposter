import { replayDeadLetterEventHandler } from "#src/handlers/replayDeadLetterEventHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ReplayDeadLetterEvent, {
  handler: replayDeadLetterEventHandler,
});

export default {};
