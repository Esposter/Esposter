import { SPEAK_LAUNCHER_PATH, SPEAK_SCRIPT_PATH } from "#src/services/constants";
import { getSettingsWithSpeakHook } from "#src/services/getSettingsWithSpeakHook";
import { readUserSettings } from "#src/services/readUserSettings";
import { writeLauncher } from "#src/services/writeLauncher";
import { writeUserSettings } from "#src/services/writeUserSettings";

// The half of `voice` that reaches user settings, written wherever the dub is: the launcher the hook runs through,
// And the hook entry pointing at it. The tool reads its hooks once per process, so the hook speaks from the next
// Session
export const writeSpeakHook = (): void => {
  writeLauncher(SPEAK_LAUNCHER_PATH, SPEAK_SCRIPT_PATH);
  writeUserSettings(getSettingsWithSpeakHook(readUserSettings()));
};
