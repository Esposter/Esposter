import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useUserSettingsStore } from "#src/store/message/user/settings/index";
import { checkIsEditableTarget } from "#src/util/dom/checkIsEditableTarget";
import { VoiceInputMode } from "@esposter/db-schema";
import { defaultWindow } from "@vueuse/core";

// Global hold-to-talk listener driving the MicrophoneProcessor gate. isInCall is injected (not read
// From the call store) so the call store itself can host this composable without a circular import.
// Key events don't cross documents, so the PiP host mounts a second instance on its own window.
export const usePushToTalk = (isInCall: MaybeRefOrGetter<boolean>, target?: MaybeRefOrGetter<undefined | Window>) => {
  const realtimeStore = useRealtimeStore();
  const { setPushToTalkKeyHeld } = realtimeStore;
  const userSettingsStore = useUserSettingsStore();
  const { userSettings } = storeToRefs(userSettingsStore);
  const listenerTarget = computed(() => (target ? toValue(target) : defaultWindow));
  const pushToTalkKeybind = computed(() => userSettings.value?.pushToTalkKeybind ?? "");
  const isActive = computed(
    () =>
      toValue(isInCall) &&
      Boolean(pushToTalkKeybind.value) &&
      userSettings.value?.voiceInputMode === VoiceInputMode.PushToTalk,
  );
  // Annotated rather than instanceof-checked — PiP window events come from another realm with its own KeyboardEvent
  useEventListener(listenerTarget, "keydown", (event: KeyboardEvent) => {
    if (!isActive.value || event.code !== pushToTalkKeybind.value || event.repeat) return;
    // Typing in the composer must not transmit — Discord behaviour
    if (checkIsEditableTarget(event.target)) return;
    event.preventDefault();
    setPushToTalkKeyHeld(true);
  });
  // Keyup always closes the gate (even from an editable element) so focus changes can't leave it stuck open
  useEventListener(listenerTarget, "keyup", (event: KeyboardEvent) => {
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
  // Rebinding mid-hold orphans the old key's keyup (it no longer matches) — close the gate so the mic can't stay open
  watch(pushToTalkKeybind, () => {
    setPushToTalkKeyHeld(false);
  });
};
