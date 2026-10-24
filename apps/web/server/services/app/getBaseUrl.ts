// The site's base url without its trailing slash, so a path can be joined onto it. Read off the environment rather than
// Through `useRuntimeConfig`, because the services that need it are plain functions called from tests that hold no Nuxt app
export const getBaseUrl = () => (process.env.BASE_URL ?? "").replace(/\/$/u, "");
