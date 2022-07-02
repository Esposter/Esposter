import NProgress from "nprogress";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    NProgress.configure({ easing: "ease", speed: 500 });

    nuxtApp.hook("page:start", () => {
      NProgress.set(0.3);
      NProgress.start();
    });

    nuxtApp.hook("page:finish", () => {
      NProgress.done();
    });
  });
});
