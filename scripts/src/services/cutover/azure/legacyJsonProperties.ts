import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";

// The properties the legacy app wrote as JSON strings in Azure, because Azure Table cannot hold an array or an object. A
// property is here when its class in the legacy app defaults to an array or an object, which decides how it is read back:
// `BaseMessageEntity` (files, mentions, linkPreviewResponse, and webhook appUser), `MessageEmojiMetadataEntity` (userIds)
// and `SurveyResponseEntity` (model). Recorded from the legacy classes at the commit before the Cloudflare program
export const legacyJsonProperties: Record<LegacyAzureTable, readonly string[]> = {
  [LegacyAzureTable.Messages]: ["appUser", "files", "linkPreviewResponse", "mentions"],
  [LegacyAzureTable.MessagesMetadata]: ["userIds"],
  [LegacyAzureTable.ModerationLog]: [],
  [LegacyAzureTable.ModerationNotes]: [],
  [LegacyAzureTable.ProgramParticipants]: [],
  [LegacyAzureTable.ResourceActivity]: [],
  [LegacyAzureTable.ResourceViews]: [],
  [LegacyAzureTable.SurveyResponses]: ["model"],
};
