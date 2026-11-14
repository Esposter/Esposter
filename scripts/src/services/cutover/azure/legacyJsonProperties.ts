import { StreamTable } from "@esposter/db-schema";

// The properties the legacy app wrote as JSON strings in Azure, because Azure Table cannot hold an array or an object. A
// property is here when its class in the legacy app defaults to an array or an object, which decides how it is read back:
// `BaseMessageEntity` (files, mentions, linkPreviewResponse, and webhook appUser) and `MessageEmojiMetadataEntity` (userIds).
// Recorded from the legacy classes at the commit before the Cloudflare program. The tables that moved to typed core tables
// without a copy mapper yet keep their record in git history (before the commit that retires their entity classes)
export const legacyJsonProperties: Record<StreamTable, readonly string[]> = {
  [StreamTable.Messages]: ["appUser", "files", "linkPreviewResponse", "mentions"],
  [StreamTable.MessagesMetadata]: ["userIds"],
};
