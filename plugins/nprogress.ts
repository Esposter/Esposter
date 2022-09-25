import nprogress from "nprogress";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    nprogress.configure({ speed: 500, minimum: 0.3 });

    nuxtApp.hook("page:start", () => {
      nprogress.start();
    });

    nuxtApp.hook("page:finish", () => {
      nprogress.done();
    });
  });
});
