export default defineNuxtPlugin((nuxtApp) => {
  const warnHandler = nuxtApp.vueApp.config.warnHandler;
  nuxtApp.vueApp.config.warnHandler = (msg, ...args) => {
    if (msg.startsWith('Slot "default" invoked outside of the render function')) return;
    warnHandler?.(msg, ...args);
  };
});
