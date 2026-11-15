import type { SettingsSection } from "#src/models/message/user/settings/SettingsSection";

import { AccountSettingsSections } from "#src/models/message/user/settings/AccountSettingsSection";
import { AppearanceSettingsSections } from "#src/models/message/user/settings/AppearanceSettingsSection";
import { KeybindsSettingsSections } from "#src/models/message/user/settings/KeybindsSettingsSection";
import { NotificationsSettingsSections } from "#src/models/message/user/settings/NotificationsSettingsSection";
import { VoiceSettingsSections } from "#src/models/message/user/settings/VoiceSettingsSection";
import { UserSettingsType } from "#src/models/message/user/UserSettingsType";

export const UserSettingsSectionMap: Record<UserSettingsType, SettingsSection[]> = {
  [UserSettingsType.Account]: AccountSettingsSections,
  [UserSettingsType.Appearance]: AppearanceSettingsSections,
  [UserSettingsType.Keybinds]: KeybindsSettingsSections,
  [UserSettingsType.Notifications]: NotificationsSettingsSections,
  [UserSettingsType.Voice]: VoiceSettingsSections,
};
