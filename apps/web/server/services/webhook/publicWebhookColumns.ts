import { pickColumns } from "#server/services/db/pickColumns";
import { PublicWebhookColumns, webhooksInMessage } from "@esposter/db-schema";
import { getColumns } from "drizzle-orm";

// Every column of a webhook a response carries: the allowlist a relational read takes, so a write answers with the
// Columns a read does
export const publicWebhookColumns = pickColumns(getColumns(webhooksInMessage), PublicWebhookColumns);
