import { purgeSurveyResourcesHandler } from "#src/handlers/purgeSurveyResourcesHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.PurgeSurveyResources, { handler: purgeSurveyResourcesHandler });

export default {};
