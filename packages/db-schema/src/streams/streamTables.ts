import { StreamTable } from "#src/models/streams/StreamTable";
import { createStreamTable } from "#src/streams/createStreamTable";

// drizzle-kit reads each table from its own export, so every member is declared once here. The client builds the
// same table from `createStreamTable` by name, so nothing else lists the members
export const messages = createStreamTable(StreamTable.Messages);
export const messagesMetadata = createStreamTable(StreamTable.MessagesMetadata);
