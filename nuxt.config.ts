import { defineNuxtConfig } from "nuxt";

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  css: ["vuetify/lib/styles/main.sass", "@mdi/font/css/materialdesignicons.min.css"],
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
  modules: ["@nuxtjs/google-fonts", "@unocss/nuxt", "@pinia/nuxt", "trpc-nuxt"],
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
    facebookClientId: process.env.FACEBOOK_CLIENT_ID || "809093449746215",
    azureStorageAccountConnectionString:
      process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING ||
      "DefaultEndpointsProtocol=https;AccountName=esposterdev;AccountKey=VlyN9MnHOIsr4VsipCVca3uQSwmIL1sTwAe5ClNsT20SUJAUveBFnQaX3aKgpmFoeZmtyQLsGy6pwBxr+ZEMfw==;BlobEndpoint=https://esposterdev.blob.core.windows.net/;QueueEndpoint=https://esposterdev.queue.core.windows.net/;TableEndpoint=https://esposterdev.table.core.windows.net/;FileEndpoint=https://esposterdev.file.core.windows.net/",
  },
});
