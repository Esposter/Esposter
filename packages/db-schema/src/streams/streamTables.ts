import { StreamTable } from "#src/models/streams/StreamTable";
import { createStreamTable } from "#src/streams/createStreamTable";

// drizzle-kit reads each table from its own export, so every member is declared once here. The client builds the
// same table from `createStreamTable` by name, so nothing else lists the members
export const messages = createStreamTable(StreamTable.Messages);
export const messagesMetadata = createStreamTable(StreamTable.MessagesMetadata);
export const moderationLog = createStreamTable(StreamTable.ModerationLog);
export const moderationNotes = createStreamTable(StreamTable.ModerationNotes);
export const programParticipants = createStreamTable(StreamTable.ProgramParticipants);
export const resourceActivity = createStreamTable(StreamTable.ResourceActivity);
export const resourceViews = createStreamTable(StreamTable.ResourceViews);
export const surveyResponses = createStreamTable(StreamTable.SurveyResponses);
