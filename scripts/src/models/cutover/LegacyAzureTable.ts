// The Azure Tables the copy reads, under the names the legacy app wrote them with. Two are the message tables the app still stores in its
// Stream schema. The other six were entities that became SQLite tables in core, and the copy still reads them from the legacy tables
export enum LegacyAzureTable {
  Messages = "Messages",
  MessagesMetadata = "MessagesMetadata",
  ModerationLog = "ModerationLog",
  ModerationNotes = "ModerationNotes",
  ProgramParticipants = "ProgramParticipants",
  ResourceActivity = "ResourceActivity",
  ResourceViews = "ResourceViews",
  SurveyResponses = "SurveyResponses",
}
