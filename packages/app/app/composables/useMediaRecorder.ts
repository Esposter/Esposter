import type { ConfigurableNavigator } from "@vueuse/core";

import { useAlertStore } from "@/store/alert";
import { defu } from "defu";

interface UseMediaRecorderOptions extends ConfigurableNavigator {
  /**
   * The constraints parameter is a MediaStreamConstraints object specifying the types of media to request, along with any requirements for each type.
   */
  constraints?: MaybeRefOrGetter<MediaStreamConstraints>;
  /**
   * Options to pass to the MediaRecorder constructor.
   */
  mediaRecorderOptions?: MaybeRefOrGetter<MediaRecorderOptions>;
  /**
   * Callback when an error occurs.
   */
  onError?: (event: Event) => void;
  /**
   * Callback when recording pauses.
   */
  onPause?: (event: Event) => void;
  /**
   * Callback when recording resumes.
   */
  onResume?: (event: Event) => void;
  /**
   * Callback when recording starts.
   */
  onStart?: (event: Event) => void;
  /**
   * Callback when recording stops.
   */
  onStop?: (event: Event) => void;
}

const defaultOptions: UseMediaRecorderOptions = {
  constraints: { audio: false, video: false },
  mediaRecorderOptions: {},
  onError: () => {},
  onPause: () => {},
  onResume: () => {},
  onStart: () => {},
  onStop: () => {},
};

export const useMediaRecorder = (options: UseMediaRecorderOptions = {}) => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const data = ref<Blob[]>([]);
  const mediaRecorder = shallowRef<MediaRecorder>();
  const stream = shallowRef<MediaStream>();
  const isMimeTypeSupported = computed(() =>
    toValue(options.mediaRecorderOptions)?.mimeType
      ? MediaRecorder.isTypeSupported(toValue(options.mediaRecorderOptions)?.mimeType ?? "")
      : true,
  );
  const isSupported = useSupported(() => "getUserMedia" in window.navigator.mediaDevices && isMimeTypeSupported.value);
  const state = computedWithControl<RecordingState | undefined>(
    () => mediaRecorder.value,
    () => mediaRecorder.value?.state,
  );
  const mimeType = computedWithControl<string | undefined>(
    () => mediaRecorder.value,
    () => mediaRecorder.value?.mimeType,
  );
  const { constraints, mediaRecorderOptions } = defu(options, defaultOptions);
  const setupMediaRecorder = (newMediaRecorder: MediaRecorder) => {
    newMediaRecorder.ondataavailable = (event) => {
      mimeType.trigger();
      data.value.push(event.data);
    };
    newMediaRecorder.onstop = (...args) => {
      for (const track of stream.value?.getTracks() ?? []) track.stop();
      state.trigger();
      mimeType.trigger();
      options.onStop?.(...args);
    };
    newMediaRecorder.onpause = (...args) => {
      state.trigger();
      mimeType.trigger();
      options.onPause?.(...args);
    };
    newMediaRecorder.onresume = (...args) => {
      state.trigger();
      mimeType.trigger();
      options.onResume?.(...args);
    };
    newMediaRecorder.onstart = (...args) => {
      state.trigger();
      mimeType.trigger();
      options.onStart?.(...args);
    };
    newMediaRecorder.onerror = (...args) => {
      state.trigger();
      mimeType.trigger();
      options.onError?.(...args);
    };
  };

  const start = async (timeslice: number | undefined) => {
    if (state.value === "recording") return;
    data.value = [];

    try {
      stream.value = await navigator.mediaDevices.getUserMedia(toValue(constraints));
    } catch (error) {
      if (error instanceof DOMException) createAlert(error.message, "error");
      return;
    }

    const newMediaRecorder = new MediaRecorder(stream.value, toValue(mediaRecorderOptions));
    setupMediaRecorder(newMediaRecorder);
    mediaRecorder.value = newMediaRecorder;
    mediaRecorder.value.start(timeslice);
  };

  const stop = () => {
    if (!state.value || state.value === "inactive") return;
    mediaRecorder.value?.stop();
  };

  const pause = () => {
    if (state.value !== "recording") return;
    mediaRecorder.value?.pause();
  };

  const resume = () => {
    if (state.value !== "paused") return;
    mediaRecorder.value?.resume();
  };

  tryOnScopeDispose(() => {
    mediaRecorder.value?.stop();
  });

  return {
    data,
    isMimeTypeSupported,
    isSupported,
    mediaRecorder: computed(() => mediaRecorder.value),
    mimeType: computed(() => mimeType.value),
    pause,
    resume,
    start,
    state,
    stop,
    stream,
  };
};
