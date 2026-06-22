import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voice";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Opens a local microphone and exposes the live input level (dB) so the Input Sensitivity panel
// Can show a calibration meter. There is no shared analyser to reuse - in-call speaking detection
// Comes from LiveKit's server-side ActiveSpeakersChanged, and this panel can be opened outside a call.
export const useMicrophoneLevel = () => {
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const { inputDeviceId } = storeToRefs(voiceDeviceSettingsStore);
  const isTesting = ref(false);
  const level = ref(MIN_INPUT_SENSITIVITY_DECIBELS);
  const constraints = computed<MediaStreamConstraints>(() => ({
    audio: { deviceId: inputDeviceId.value || undefined },
  }));
  const { start: startStream, stop: stopStream } = useUserMedia({ constraints });
  let audioContext: AudioContext | undefined;
  let analyser: AnalyserNode | undefined;
  let timeDomainData: Float32Array<ArrayBuffer> | undefined;
  const { pause, resume } = useRafFn(
    () => {
      if (!analyser || !timeDomainData) return;
      // Float (not byte) time-domain data: 8-bit quantization clusters quiet input around the
      // Midpoint, so the meter barely moves; floats give full precision across the range.
      analyser.getFloatTimeDomainData(timeDomainData);
      let sumSquares = 0;
      for (const sample of timeDomainData) sumSquares += sample * sample;
      const rms = Math.sqrt(sumSquares / timeDomainData.length);
      const decibels = rms > 0 ? 20 * Math.log10(rms) : MIN_INPUT_SENSITIVITY_DECIBELS;
      level.value = Math.min(MAX_INPUT_SENSITIVITY_DECIBELS, Math.max(MIN_INPUT_SENSITIVITY_DECIBELS, decibels));
    },
    { immediate: false },
  );
  const start = async () => {
    await getResultAsync(startStream).match(
      (stream) => {
        if (!stream) return;
        audioContext = new window.AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        timeDomainData = new Float32Array(analyser.fftSize);
        audioContext.createMediaStreamSource(stream).connect(analyser);
        isTesting.value = true;
        resume();
      },
      () => {
        isTesting.value = false;
      },
    );
  };
  const stop = () => {
    pause();
    void audioContext?.close();
    audioContext = undefined;
    analyser = undefined;
    timeDomainData = undefined;
    stopStream();
    level.value = MIN_INPUT_SENSITIVITY_DECIBELS;
    isTesting.value = false;
  };

  onScopeDispose(stop);

  return { isTesting, level, start, stop };
};
