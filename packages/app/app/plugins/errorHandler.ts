export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
    console.error(`[Vue] ${info}:`, error);
  };

  nuxtApp.hook("vue:error", (error, _instance, info) => {
    console.error(`[Nuxt] ${info}:`, error);
  });
});
