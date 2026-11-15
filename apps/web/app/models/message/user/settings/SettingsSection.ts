import type { AccountSettingsSection } from "#src/models/message/user/settings/AccountSettingsSection";
import type { AppearanceSettingsSection } from "#src/models/message/user/settings/AppearanceSettingsSection";
import type { KeybindsSettingsSection } from "#src/models/message/user/settings/KeybindsSettingsSection";
import type { NotificationsSettingsSection } from "#src/models/message/user/settings/NotificationsSettingsSection";
import type { VoiceSettingsSection } from "#src/models/message/user/settings/VoiceSettingsSection";

export type SettingsSection =
  | AccountSettingsSection
  | AppearanceSettingsSection
  | KeybindsSettingsSection
  | NotificationsSettingsSection
  | VoiceSettingsSection;
