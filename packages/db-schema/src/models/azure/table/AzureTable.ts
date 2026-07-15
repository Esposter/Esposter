export enum AzureTable {
  Messages = "Messages",
  // Index table of just the message partition/row key, keyed by the original timestamp so messages
  // Can be double-indexed and sorted both ways.
  MessagesAscending = "MessagesAscending",
  MessagesMetadata = "MessagesMetadata",
  ModerationLog = "ModerationLog",
  ProgramParticipants = "ProgramParticipants",
  // Per-resource audit trail — partitioned by resourceId, newest-first by reverse-ticked rowKey.
  ResourceActivity = "ResourceActivity",
  // Best-effort public view counters, bucketed per resource per UTC day
  ResourceViews = "ResourceViews",
  SurveyResponses = "SurveyResponses",
}
