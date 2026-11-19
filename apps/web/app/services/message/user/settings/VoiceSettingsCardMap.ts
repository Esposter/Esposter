import VoiceDevices from "#src/components/Message/Model/User/Settings/Type/Voice/Devices/Index.vue";
import VoiceInputMode from "#src/components/Message/Model/User/Settings/Type/Voice/InputMode.vue";
import VoiceInputProfile from "#src/components/Message/Model/User/Settings/Type/Voice/InputProfile/Index.vue";
import VoiceInputSensitivity from "#src/components/Message/Model/User/Settings/Type/Voice/InputSensitivity/Index.vue";
import VoiceJoinSwitches from "#src/components/Message/Model/User/Settings/Type/Voice/JoinSwitches.vue";
import { VoiceSettingsSection } from "#src/models/message/user/settings/VoiceSettingsSection";

// The card each voice section is drawn with. Keyed by every section, so a section without a card is a type error
// Rather than a heading with nothing under it
export const VoiceSettingsCardMap = {
  [VoiceSettingsSection.Devices]: VoiceDevices,
  [VoiceSettingsSection.InputMode]: VoiceInputMode,
  [VoiceSettingsSection.InputProfile]: VoiceInputProfile,
  [VoiceSettingsSection.InputSensitivity]: VoiceInputSensitivity,
  [VoiceSettingsSection.JoinSettings]: VoiceJoinSwitches,
} as const satisfies Record<VoiceSettingsSection, Component>;
