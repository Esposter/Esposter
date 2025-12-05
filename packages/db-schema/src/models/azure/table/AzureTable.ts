export enum AzureTable {
  Messages = "Messages",
  // An index table that only contains the message partition key and row key
  // where the row key is the original timestamp of the message to allow for double indexing and sorting the messages both ways
  MessagesAscending = "MessagesAscending",
  MessagesMetadata = "MessagesMetadata",
  SurveyResponses = "SurveyResponses",
  UserActivities = "UserActivities",
}
