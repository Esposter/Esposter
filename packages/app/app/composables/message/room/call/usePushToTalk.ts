import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { VoiceInputMode } from "@esposter/db-schema";
import { checkIsEditableTarget } from "@/util/dom/checkIsEditableTarget";
import { defaultWindow } from "@vueuse/core";

// Global hold-to-talk listener driving the MicrophoneProcessor gate. isInCall is injected (not read
// From the call store) so the call store itself can host this composable without a circular import.
// Key events don't cross documents, so the PiP host mounts a second instance on its own window.
export const usePushToTalk = (isInCall: MaybeRefOrGetter<boolean>, target?: MaybeRefOrGetter<null | Window>) => {
  const liveKitStore = useLiveKitStore();
  const { setPushToTalkKeyHeld } = liveKitStore;
  const userSettingsStore = useUserSettingsStore();
  const listenerTarget = computed(() => (target ? toValue(target) : defaultWindow));
  const pushToTalkKeybind = computed(() => userSettingsStore.userSettings?.pushToTalkKeybind ?? "");
  const isActive = computed(
    () =>
      toValue(isInCall) &&
      Boolean(pushToTalkKeybind.value) &&
      userSettingsStore.userSettings?.voiceInputMode === VoiceInputMode.PushToTalk,
  );

  useEventListener(listenerTarget, "keydown", (event) => {
    if (!isActive.value || event.code !== pushToTalkKeybind.value || event.repeat) return;
    // Typing in the composer must not transmit — Discord behaviour
    if (checkIsEditableTarget(event.target)) return;
    event.preventDefault();
    setPushToTalkKeyHeld(true);
  });
  // Keyup always closes the gate (even from an editable element) so focus changes can't leave it stuck open
  useEventListener(listenerTarget, "keyup", (event) => {
    if (event.code !== pushToTalkKeybind.value) return;
    setPushToTalkKeyHeld(false);
  });
  // Key releases outside a blurred window are invisible — close the gate on blur
  useEventListener(listenerTarget, "blur", () => {
    setPushToTalkKeyHeld(false);
  });
  watch(isActive, (newIsActive) => {
    if (!newIsActive) setPushToTalkKeyHeld(false);
  });
};
