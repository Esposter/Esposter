import nProgress from "nprogress";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    nProgress.configure({ speed: 500, minimum: 0.3 });

    nuxtApp.hook("page:start", () => {
      nProgress.start();
    });

    nuxtApp.hook("page:finish", () => {
      nProgress.done();
    });
  });
});
