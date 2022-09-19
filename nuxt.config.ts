import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "emoji-mart-vue-fast/css/emoji-mart.css",
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/_variables.scss";',
        },
      },
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  modules: ["@nuxtjs/google-fonts", "@unocss/nuxt", "@pinia/nuxt", "@vueuse/nuxt", "trpc-nuxt"],
  typescript: {
    strict: true,
  },
  googleFonts: {
    families: {
      Montserrat: true,
    },
  },
  unocss: {
    attributify: true,
    theme: {
      fontFamily: {
        Montserrat: ["Montserrat"],
      },
    },
    rules: [["break-word", { "word-break": "break-word" }]],
  },
  runtimeConfig: {
    public: {
      facebookClientId: process.env.FACEBOOK_CLIENT_ID,
    },
    azureStorageAccountConnectionString: process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING,
  },
});
