import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";

interface UseMediaRecorderOptions {
  /** Media types to request, with any per-type requirements. */
  constraints?: MaybeRefOrGetter<MediaStreamConstraints>;
  /** Options passed to the MediaRecorder constructor. */
  mediaRecorderOptions?: MaybeRefOrGetter<MediaRecorderOptions>;
  onError?: (event: Event) => void;
  onPause?: (event: Event) => void;
  onResume?: (event: Event) => void;
  onStart?: (event: Event) => void;
  onStop?: (event: Event) => void;
}

export const useMediaRecorder = (options: UseMediaRecorderOptions = {}) => {
  const { constraints = {}, mediaRecorderOptions = {} } = options;
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const data = ref<Blob[]>([]);
  const mediaRecorder = shallowRef<MediaRecorder>();
  const {
    isSupported: isUserMediaSupported,
    start: startStream,
    stop: stopStream,
    stream,
  } = useUserMedia({ constraints: computed(() => toValue(constraints)) });
  const isMimeTypeSupported = computed(() => {
    const requestedMimeType = toValue(mediaRecorderOptions).mimeType;
    return requestedMimeType ? MediaRecorder.isTypeSupported(requestedMimeType) : true;
  });
  const isSupported = computed(() => isUserMediaSupported.value && isMimeTypeSupported.value);
  // MediaRecorder has no change event, so its imperative state/mimeType are mirrored into refs on each lifecycle event.
  const state = ref<RecordingState>();
  const mimeType = ref<string>();
  const setupMediaRecorder = (newMediaRecorder: MediaRecorder) => {
    const onLifecycle = (callback?: (event: Event) => void) => (event: Event) => {
      state.value = newMediaRecorder.state;
      mimeType.value = newMediaRecorder.mimeType;
      callback?.(event);
    };
    newMediaRecorder.ondataavailable = (event) => {
      // MimeType can resolve only once the first chunk arrives, so refresh it here too.
      mimeType.value = newMediaRecorder.mimeType;
      data.value.push(event.data);
    };
    newMediaRecorder.onstart = onLifecycle(options.onStart);
    newMediaRecorder.onstop = onLifecycle((event) => {
      stopStream();
      options.onStop?.(event);
    });
    newMediaRecorder.onpause = onLifecycle(options.onPause);
    newMediaRecorder.onresume = onLifecycle(options.onResume);
    newMediaRecorder.onerror = onLifecycle(options.onError);
  };

  const start = async (timeslice?: number) => {
    if (state.value && state.value !== "inactive") return;
    else if (!isSupported.value) {
      createAlert("Media devices API is not supported in this environment.", "error");
      return;
    }
    data.value = [];
    // Release any lingering stream so useUserMedia re-requests a fresh one.
    stopStream();

    await getResultAsync(startStream).match(noop, (error) => {
      if (error instanceof DOMException) createAlert(error.message, "error");
      else console.error(error);
    });
    if (!stream.value) return;

    const newMediaRecorder = new MediaRecorder(stream.value, toValue(mediaRecorderOptions));
    setupMediaRecorder(newMediaRecorder);
    mediaRecorder.value = newMediaRecorder;
    newMediaRecorder.start(timeslice);
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
    mimeType,
    pause,
    resume,
    start,
    state,
    stop,
    stream,
  };
};
