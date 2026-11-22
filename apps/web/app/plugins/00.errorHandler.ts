export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("vue:error", (error, _instance, info) => {
    console.error(`[Vue] ${info}:`, error);
  });
});
