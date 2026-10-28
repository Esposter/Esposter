export enum VoiceSettingsSection {
  Devices = "Devices",
  InputMode = "Input Mode",
  InputProfile = "Input Profile",
  InputSensitivity = "Input Sensitivity",
  JoinSettings = "Join Settings",
}

// The sections in the order the settings render them, which the enum's own order no longer carries
// Keyed by section so a new section fails the typecheck until it names its place rather than being left out of the nav
const VoiceSettingsSectionOrder: Record<VoiceSettingsSection, number> = {
  [VoiceSettingsSection.Devices]: 0,
  [VoiceSettingsSection.InputMode]: 3,
  [VoiceSettingsSection.InputProfile]: 1,
  [VoiceSettingsSection.InputSensitivity]: 2,
  [VoiceSettingsSection.JoinSettings]: 4,
};
export const VoiceSettingsSections = Object.values(VoiceSettingsSection).toSorted(
  (firstSection, secondSection) => VoiceSettingsSectionOrder[firstSection] - VoiceSettingsSectionOrder[secondSection],
);
