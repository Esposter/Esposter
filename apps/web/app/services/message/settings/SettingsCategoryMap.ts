import { SettingsCategory } from "#src/models/message/room/SettingsCategory";
import { SettingsType } from "#src/models/message/room/SettingsType";

// Discord Server Settings grouping — Delete stays a standalone destructive item below the categories. The literal keeps
// Its element types, so a settings type missing from every group fails the type test beside this file
export const SettingsCategoryMap = {
  [SettingsCategory.General]: [SettingsType.Overview, SettingsType.Roles, SettingsType.Profile, SettingsType.Emojis],
  [SettingsCategory.Integrations]: [SettingsType.Webhooks],
  [SettingsCategory.Moderation]: [
    SettingsType.WordFilter,
    SettingsType.AuditLog,
    SettingsType.Bans,
    SettingsType.Attachments,
  ],
  [SettingsCategory.UserManagement]: [SettingsType.Members, SettingsType.Invites],
} as const satisfies Record<SettingsCategory, readonly SettingsType[]>;
