import type { OnlineSubscribableContext } from "@/composables/shared/useOnlineSubscribable";

// A subscription established outside a setup frame — inside a watcher, a callback, an `onMounted` body — has no
// Current instance or scope of its own to bind its teardown to. Capturing them where there still is one and
// Handing them over is what lets the subscribable be established later and still be torn down with its owner.
export const getOnlineSubscribableContext = (): OnlineSubscribableContext => ({
  instance: getCurrentInstance(),
  scope: getCurrentScope(),
});
