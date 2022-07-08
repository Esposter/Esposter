import NProgress from "nprogress";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    NProgress.configure({ speed: 500, minimum: 0.3 });

    nuxtApp.hook("page:start", () => {
      NProgress.start();
    });

    nuxtApp.hook("page:finish", () => {
      NProgress.done();
    });
  });
});
