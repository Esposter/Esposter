import type { Ref } from "vue";

// What the engine's register module hands a client plugin, as far as the plugin uses it. The module itself exists
// Only in the app's build, so the generated plugin imports it and passes it in
export type UseRegisterSW = (options: {
  immediate: boolean;
  onRegisteredSW: (swUrl: string, registration?: ServiceWorkerRegistration) => void;
  onRegisterError: (error: unknown) => void;
}) => { needRefresh: Ref<boolean>; offlineReady: Ref<boolean>; updateServiceWorker: () => Promise<void> };
