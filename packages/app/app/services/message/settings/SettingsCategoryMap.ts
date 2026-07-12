/* eslint-disable perfectionist/sort-objects */
import { SettingsCategory } from "@/models/message/room/SettingsCategory";
import { SettingsType } from "@/models/message/room/SettingsType";

// Discord Server Settings grouping — Delete stays a standalone destructive item below the categories
export const SettingsCategoryMap: Record<SettingsCategory, SettingsType[]> = {
  [SettingsCategory.General]: [SettingsType.Overview, SettingsType.Roles, SettingsType.Profile],
  [SettingsCategory.Integrations]: [SettingsType.Webhooks],
  [SettingsCategory.Moderation]: [SettingsType.WordFilter, SettingsType.AuditLog, SettingsType.Bans],
  [SettingsCategory.UserManagement]: [SettingsType.Members, SettingsType.Invites],
};
