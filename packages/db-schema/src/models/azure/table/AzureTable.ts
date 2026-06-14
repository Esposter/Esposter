export enum AzureTable {
  Messages = "Messages",
  // Index table of just the message partition/row key, keyed by the original timestamp so messages
  // Can be double-indexed and sorted both ways.
  MessagesAscending = "MessagesAscending",
  MessagesMetadata = "MessagesMetadata",
  ModerationLog = "ModerationLog",
  SurveyResponses = "SurveyResponses",
  UserActivities = "UserActivities",
}
