import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

import { AccountSettingsSections } from "@/models/message/user/settings/AccountSettingsSection";
import { AppearanceSettingsSections } from "@/models/message/user/settings/AppearanceSettingsSection";
import { KeybindsSettingsSections } from "@/models/message/user/settings/KeybindsSettingsSection";
import { NotificationsSettingsSections } from "@/models/message/user/settings/NotificationsSettingsSection";
import { VoiceSettingsSections } from "@/models/message/user/settings/VoiceSettingsSection";
import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const UserSettingsSectionMap: Record<UserSettingsType, SettingsSection[]> = {
  [UserSettingsType.Account]: AccountSettingsSections,
  [UserSettingsType.Appearance]: AppearanceSettingsSections,
  [UserSettingsType.Keybinds]: KeybindsSettingsSections,
  [UserSettingsType.Notifications]: NotificationsSettingsSections,
  [UserSettingsType.Voice]: VoiceSettingsSections,
};
