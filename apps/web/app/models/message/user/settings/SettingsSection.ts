import type { AccountSettingsSection } from "@/models/message/user/settings/AccountSettingsSection";
import type { AppearanceSettingsSection } from "@/models/message/user/settings/AppearanceSettingsSection";
import type { KeybindsSettingsSection } from "@/models/message/user/settings/KeybindsSettingsSection";
import type { NotificationsSettingsSection } from "@/models/message/user/settings/NotificationsSettingsSection";
import type { VoiceSettingsSection } from "@/models/message/user/settings/VoiceSettingsSection";

export type SettingsSection =
  | AccountSettingsSection
  | AppearanceSettingsSection
  | KeybindsSettingsSection
  | NotificationsSettingsSection
  | VoiceSettingsSection;
