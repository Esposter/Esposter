import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.DeleteOrphanedProfileImage, { handler: deleteOrphanedProfileImageHandler });

export default {};
