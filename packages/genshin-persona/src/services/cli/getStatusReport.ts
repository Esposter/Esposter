import type { GenshinContext } from "#src/models/GenshinContext";
import type { StatusReport } from "#src/models/StatusReport";

import { checkIsMuted } from "#src/services/checkIsMuted";
import { checkIsPluginHookEntry } from "#src/services/checkIsPluginHookEntry";
import { checkIsPluginSpinner } from "#src/services/checkIsPluginSpinner";
import { checkIsPluginStatusLine } from "#src/services/checkIsPluginStatusLine";
import { checkIsRuntimeInstalled } from "#src/services/checkIsRuntimeInstalled";
import { getLanguageDisplayName } from "#src/services/getLanguageDisplayName";
import { readPin } from "#src/services/readPin";
import { readReplyLanguage } from "#src/services/readReplyLanguage";
import { readUserSettings } from "#src/services/readUserSettings";
import { readVoiceDevice } from "#src/services/readVoiceDevice";
import { readVoiceLanguage } from "#src/services/readVoiceLanguage";
import { readVolume } from "#src/services/readVolume";
import { resolveSessionCharacter } from "#src/services/resolveSessionCharacter";

// Every knob in one read, for the verbs that report rather than change: the status verb, and either language verb
// Given no argument
export const getStatusReport = async ({
  language,
  roster,
  sessionId,
  today,
}: GenshinContext): Promise<StatusReport> => {
  const pin = readPin();
  const pick = sessionId ? await resolveSessionCharacter(roster, sessionId, today) : undefined;
  const replyLanguage = readReplyLanguage();
  const settings = readUserSettings();
  return {
    displayName: pick?.character.displayName ?? pin?.displayName ?? "",
    interfaceLanguage: getLanguageDisplayName(language, language),
    isFromSessionRecord: Boolean(pick),
    isMuted: checkIsMuted(),
    isPluginSpeakHook: settings.hooks?.MessageDisplay?.some((entry) => checkIsPluginHookEntry(entry)) ?? false,
    isPluginSpinner: checkIsPluginSpinner(settings),
    isPluginStatusLine: checkIsPluginStatusLine(settings.statusLine),
    isReplyLanguageCascaded: !replyLanguage,
    isRuntimeInstalled: checkIsRuntimeInstalled(),
    pinnedName: pin?.name ?? "",
    replyLanguage: getLanguageDisplayName(replyLanguage ?? language, language),
    voiceDevice: readVoiceDevice(),
    voiceLanguage: readVoiceLanguage(),
    volume: readVolume(),
  };
};
