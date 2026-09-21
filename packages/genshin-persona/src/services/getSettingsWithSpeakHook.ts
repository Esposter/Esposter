import type { UserHooks } from "#src/models/UserHooks";
import type { UserSettings } from "#src/models/UserSettings";

import { checkIsPluginHookEntry } from "#src/services/checkIsPluginHookEntry";
import { getPluginSpeakHookEntry } from "#src/services/getPluginSpeakHookEntry";

// Every other entry under the event is somebody else's and stays, ours is written once however many times the
// `voice` verb runs, and every other event passes through
export const getSettingsWithSpeakHook = (settings: UserSettings): UserSettings => {
  const { MessageDisplay: messageDisplayEntries = [], ...otherHooks }: UserHooks = settings.hooks ?? {};
  const foreignEntries = messageDisplayEntries.filter((entry) => !checkIsPluginHookEntry(entry));
  return { ...settings, hooks: { ...otherHooks, MessageDisplay: [...foreignEntries, getPluginSpeakHookEntry()] } };
};
