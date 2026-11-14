import { StreamTable } from "@esposter/db-schema";

// The properties the legacy app wrote as JSON strings in Azure, because Azure Table cannot hold an array or an object. A
// property is here when its class in the legacy app defaults to an array or an object, which decides how it is read back:
// `BaseMessageEntity` (files, mentions, linkPreviewResponse, and webhook appUser), `MessageEmojiMetadataEntity` (userIds)
// and `SurveyResponseEntity` (model). Recorded from the legacy classes at the commit before the Cloudflare program
export const legacyJsonProperties: Record<StreamTable, readonly string[]> = {
  [StreamTable.Messages]: ["appUser", "files", "linkPreviewResponse", "mentions"],
  [StreamTable.MessagesMetadata]: ["userIds"],
  [StreamTable.ModerationLog]: [],
  [StreamTable.ModerationNotes]: [],
  [StreamTable.ProgramParticipants]: [],
  [StreamTable.ResourceActivity]: [],
  [StreamTable.ResourceViews]: [],
  [StreamTable.SurveyResponses]: ["model"],
};
