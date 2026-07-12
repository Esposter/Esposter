import type { SettingsSection } from "@/models/message/user/settings/SettingsSection";

import { AppearanceSettingsSection } from "@/models/message/user/settings/AppearanceSettingsSection";
import { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import { NotificationsSettingsSection } from "@/models/message/user/settings/NotificationsSettingsSection";
import { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";
import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const UserSettingsSectionMap: Record<UserSettingsType, SettingsSection[]> = {
  [UserSettingsType.Appearance]: Object.values(AppearanceSettingsSection),
  [UserSettingsType.Keybinds]: Object.values(KeybindsSettingsSection),
  [UserSettingsType.Notifications]: Object.values(NotificationsSettingsSection),
  [UserSettingsType.Voice]: Object.values(VoiceSettingsSection),
};
