export default defineNuxtPlugin((nuxtApp) => {
  const warnHandler = nuxtApp.vueApp.config.warnHandler;
  nuxtApp.vueApp.config.warnHandler = (message, ...args) => {
    if (message.startsWith('Slot "default" invoked outside of the render function')) return;
    warnHandler?.(message, ...args);
  };
});
