import type { App } from "vue";

// Runs in the page before any of its scripts. Vue sets `__vue_app__` on the root container as `mount` returns, and Nuxt
// Hangs its app off the Vue app's `$nuxt`, whose `app:suspense:resolve` fires once the last suspended component has
// Hydrated, so the page reports completion as an event rather than a wait the check guesses at
export const observeHydration = (binding: string) => {
  const reportHydrated = () => {
    Reflect.apply(Reflect.get(globalThis, binding), globalThis, []);
  };
  Object.defineProperty(HTMLElement.prototype, "__vue_app__", {
    configurable: true,
    // Nothing is mounted on an element before Vue's own write
    get: () => undefined,
    set(this: HTMLElement, app: App) {
      Object.defineProperty(this, "__vue_app__", { configurable: true, value: app, writable: true });
      const nuxtApp = app.config.globalProperties.$nuxt;
      if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce("app:suspense:resolve", reportHydrated);
      else reportHydrated();
    },
  });
};
