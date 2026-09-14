import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop } from "@esposter/shared";

interface UseMediaRecorderOptions {
  constraints?: MaybeRefOrGetter<MediaStreamConstraints>;
  onError?: (event: Event) => void;
  onStart?: (event: Event) => void;
  onStop?: (event: Event) => void;
}

export const useMediaRecorder = (options: UseMediaRecorderOptions = {}) => {
  const { constraints = {} } = options;
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const data = ref<Blob[]>([]);
  const mediaRecorder = shallowRef<MediaRecorder>();
  const {
    isSupported,
    start: startStream,
    stop: stopStream,
    stream,
  } = useUserMedia({ constraints: computed(() => toValue(constraints)) });
  // MediaRecorder has no change event, so its imperative state is mirrored into a ref on each lifecycle event.
  const state = ref<RecordingState>();
  const setupMediaRecorder = (newMediaRecorder: MediaRecorder) => {
    const onLifecycle = (callback?: (event: Event) => void) => (event: Event) => {
      state.value = newMediaRecorder.state;
      callback?.(event);
    };
    newMediaRecorder.ondataavailable = (event) => {
      data.value.push(event.data);
    };
    newMediaRecorder.onstart = onLifecycle(options.onStart);
    newMediaRecorder.onstop = onLifecycle((event) => {
      stopStream();
      options.onStop?.(event);
    });
    newMediaRecorder.onerror = onLifecycle(options.onError);
  };

  const start = async () => {
    if (state.value && state.value !== "inactive") return;
    else if (isSupported.value) {
      data.value = [];
      // Release any lingering stream so useUserMedia re-requests a fresh one.
      stopStream();

      await getResultAsync(startStream).match(noop, (error) => {
        // A DOMException is the device refusing — the user picked this device, so they are told. Anything
        // Else reaching here is a programming error nobody watching a recorder can act on
        if (error instanceof DOMException) createErrorAlert(error);
        else console.error(error);
      });
      if (!stream.value) return;

      const newMediaRecorder = new MediaRecorder(stream.value);
      setupMediaRecorder(newMediaRecorder);
      mediaRecorder.value = newMediaRecorder;
      newMediaRecorder.start();
    } else createAlert("Media devices API is not supported in this environment.", "error");
  };

  const stop = () => {
    if (!state.value || state.value === "inactive") return;
    mediaRecorder.value?.stop();
  };

  tryOnScopeDispose(() => {
    mediaRecorder.value?.stop();
  });

  return { data, start, state, stop };
};
