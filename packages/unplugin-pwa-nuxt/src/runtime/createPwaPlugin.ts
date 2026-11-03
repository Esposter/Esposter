import type { Pwa } from "#src/runtime/models/Pwa";
import type { UseRegisterSW } from "#src/runtime/models/UseRegisterSW";
import type { ObjectPlugin } from "nuxt/app";

import { MODULE_NAME } from "#src/runtime/constants";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { defineNuxtPlugin } from "nuxt/app";
import { reactive, ref } from "vue";

/**
 * Registers the worker, through `useRegisterSW` from the engine's register module, once the app is up and provides `$pwa`: whether a new worker waits (`needRefresh`) or the
 * app can now run offline (`offlineReady`), and how to activate the waiting one. `periodicSyncForUpdates` is the
 * seconds between checks for a newer worker, none when absent.
 */
export const createPwaPlugin = (
  useRegisterSW: UseRegisterSW,
  periodicSyncForUpdates?: number,
): ObjectPlugin<{ pwa: Pwa }> =>
  defineNuxtPlugin({
    enforce: "post",
    name: `${MODULE_NAME}:client`,
    parallel: true,
    setup() {
      const registrationError = ref(false);
      const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
        immediate: true,
        onRegisteredSW: (_swUrl, registration) => {
          if (!registration || !periodicSyncForUpdates) return;
          setInterval(
            getSynchronizedFunction(async () => {
              if (window.navigator.onLine && !registration.installing)
                await getResultAsync(() => registration.update()).match(noop, console.error);
            }),
            periodicSyncForUpdates * 1000,
          );
        },
        onRegisterError: () => {
          registrationError.value = true;
        },
      });
      return { provide: { pwa: reactive({ needRefresh, offlineReady, registrationError, updateServiceWorker }) } };
    },
  });
