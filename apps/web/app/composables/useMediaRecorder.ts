import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

interface UseMediaRecorderOptions {
  constraints?: MaybeRefOrGetter<MediaStreamConstraints>;
  onError?: (event: Event) => void;
  onStart?: (event: Event) => void;
  onStop?: (event: Event) => void;
}

export const useMediaRecorder = ({ constraints = {}, onError, onStart, onStop }: UseMediaRecorderOptions = {}) => {
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
    newMediaRecorder.onstart = onLifecycle(onStart);
    newMediaRecorder.onstop = onLifecycle((event) => {
      stopStream();
      onStop?.(event);
    });
    newMediaRecorder.onerror = onLifecycle(onError);
  };

  // Held across the device's await, since no recorder exists to read the state of until the stream is in hand.
  // Once the recorder is made, a start reads its own state, not the mirror that lands on the lifecycle event
  let isStarting = false;
  const start = async () => {
    if (isStarting || (mediaRecorder.value && mediaRecorder.value.state !== "inactive")) return;
    else if (isSupported.value) {
      isStarting = true;
      await withFinalizerAsync(
        async () => {
          data.value = [];
          // Release any lingering stream so useUserMedia re-requests a fresh one.
          stopStream();

          await getResultAsync(() => startStream()).match(noop, (error) => {
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
        },
        () => {
          isStarting = false;
        },
      );
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
