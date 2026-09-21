import type { VoiceLanguage } from "#src/models/VoiceLanguage";

// Every knob the plugin holds, read in one pass so one line can be written about all of them. A value and where it
// Came from are different facts and only the second explains the behaviour, so the routes ride beside the values:
// Whether this session has a character of its own or is reading the pin, whether the reply language was set or
// Cascaded from the interface language, and whether the three user settings in play are the plugin's
export interface StatusReport {
  // Who the interface language spells this session's character as, "" outside a session with no pin either
  displayName: string;
  interfaceLanguage: string;
  isFromSessionRecord: boolean;
  isMuted: boolean;
  isPluginSpeakHook: boolean;
  isPluginSpinner: boolean;
  isPluginStatusLine: boolean;
  isReplyLanguageCascaded: boolean;
  isRuntimeInstalled: boolean;
  // The English name the pin fixes, "" when nothing is pinned
  pinnedName: string;
  replyLanguage: string;
  // The rung the engine settled on, "" before it has spoken
  voiceDevice: string;
  // The dub, absent until the voice verb has set one up
  voiceLanguage?: VoiceLanguage;
  volume: number;
}
