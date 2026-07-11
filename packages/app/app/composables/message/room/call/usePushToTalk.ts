import { checkIsEditableElement } from "@/services/message/room/call/checkIsEditableElement";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { VoiceInputMode } from "@esposter/db-schema";
import { getIsServer } from "@esposter/shared";

// Global hold-to-talk listener: while the configured keybind is held the mic gate opens; released,
// It closes after the release-delay grace period. The liveKit store registers it on the main window
// (so it survives navigation, like the call itself); Pip/Host registers it again on the PiP window
// Since key events don't cross documents. Keys only arrive while an app window is focused — true
// OS-level push-to-talk needs a desktop app and is out of scope.
export const usePushToTalk = (
  setIsPushToTalkHeld: (isHeld: boolean) => void,
  target?: MaybeRefOrGetter<null | Window>,
) => {
  const listenerTarget = target ?? (getIsServer() ? null : window);
  const userSettingsStore = useUserSettingsStore();
  // Accepts the base Event (the reffed/nullable target resolves the generic listener overload) and
  // Narrows via `in` — a cross-realm-safe check, since PiP window events fail `instanceof KeyboardEvent`.
  const checkIsKeybindMatch = (event: Event) => {
    const { pushToTalkKeybind, voiceInputMode } = userSettingsStore.userSettings ?? {};
    if (voiceInputMode !== VoiceInputMode.PushToTalk || !pushToTalkKeybind) return false;
    return "code" in event && event.code === pushToTalkKeybind;
  };

  useEventListener(listenerTarget, "keydown", (event) => {
    if (!checkIsKeybindMatch(event) || checkIsEditableElement(event.target)) return;
    event.preventDefault();
    setIsPushToTalkHeld(true);
  });

  useEventListener(listenerTarget, "keyup", (event) => {
    if (!checkIsKeybindMatch(event)) return;
    setIsPushToTalkHeld(false);
  });

  // Keyup never arrives if focus leaves the window while the key is held — release on blur so the
  // Gate can't stick open.
  useEventListener(listenerTarget, "blur", () => {
    setIsPushToTalkHeld(false);
  });
};
