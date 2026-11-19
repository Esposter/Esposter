import { computeInputLevelDecibels } from "#src/services/message/room/call/computeInputLevelDecibels";
import { useVoiceDeviceSettingsStore } from "#src/store/message/user/settings/voiceDevice";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

// Opens a local microphone and exposes the live input level (dB) so the Input Sensitivity panel
// Can show a calibration meter. There is no shared analyser to reuse - in-call speaking detection
// Comes from the call's active-speaker event, and this panel can be opened outside a call.
// The stream itself is the store's: every panel reading a level holds the one microphone, so two panels open it once.
export const useMicrophoneLevel = () => {
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const { holdMicrophone, isMicrophoneHeldBy, releaseMicrophone } = voiceDeviceSettingsStore;
  const holder = Symbol("microphone level");
  const isTesting = ref(false);
  const level = ref(MIN_INPUT_SENSITIVITY_DECIBELS);
  let audioContext: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let timeDomainData: Float32Array<ArrayBuffer> | undefined;
  const { pause, resume } = useRafFn(
    () => {
      if (!analyser || !timeDomainData) return;
      // Float (not byte) time-domain data: 8-bit quantization clusters quiet input around the
      // Midpoint, so the meter barely moves; floats give full precision across the range.
      analyser.getFloatTimeDomainData(timeDomainData);
      const decibels = computeInputLevelDecibels(timeDomainData);
      level.value = Math.min(MAX_INPUT_SENSITIVITY_DECIBELS, Math.max(MIN_INPUT_SENSITIVITY_DECIBELS, decibels));
    },
    { immediate: false },
  );
  const { executeQuery } = useMutation();
  // A start that lands while one is pending joins it, so a double click cannot open a second stream beside the first
  const start = async () => {
    await executeQuery(() => holdMicrophone(holder), {
      isExclusive: true,
      key: "start",
      onError: (error) => {
        releaseMicrophone(holder);
        isTesting.value = false;
        console.error(error);
      },
      onSuccess: async (stream) => {
        // A stop or a dispose that lands while the request is pending releases this panel's hold, and the store closes
        // The stream it resolves once no panel holds it, so a stream this panel no longer holds starts nothing
        if (!stream || !isMicrophoneHeldBy(holder)) return;
        // A start that lands on a running test reuses its stream, so the context it replaces is taken out here
        const previousAudioContext = audioContext;
        audioContext = new window.AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        timeDomainData = new Float32Array(analyser.fftSize);
        audioContext.createMediaStreamSource(stream).connect(analyser);
        isTesting.value = true;
        resume();
        // Closed only after the new graph is in place: nothing this callback writes follows the await, so a stop()
        // That lands during the close cannot be overtaken by a state write
        if (previousAudioContext) await getResultAsync(() => previousAudioContext.close()).match(noop, console.error);
      },
    });
  };
  const stop = async () => {
    pause();
    // Tear down synchronously, then close last, so a re-entrant start() cannot observe a half-stopped graph
    const previousAudioContext = audioContext;
    audioContext = undefined;
    analyser = undefined;
    timeDomainData = undefined;
    releaseMicrophone(holder);
    level.value = MIN_INPUT_SENSITIVITY_DECIBELS;
    isTesting.value = false;
    await previousAudioContext?.close();
  };

  onScopeDispose(getSynchronizedFunction(() => getResultAsync(() => stop()).match(noop, console.error)));

  return { isTesting, level, start, stop };
};
