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
      "DefaultEndpointsProtocol=https;AccountName=dshpstespauea001;AccountKey=QYIQmACOBdRXGUkysPRCVdN+H0Jj2ruOR/fGw7wLnnqXvSHRUIiwuTyrJ4iJmjYnDXrDnSY0W4m4+ASt8G6euQ==;BlobEndpoint=https://dshpstespauea001.blob.core.windows.net/;QueueEndpoint=https://dshpstespauea001.queue.core.windows.net/;TableEndpoint=https://dshpstespauea001.table.core.windows.net/;FileEndpoint=https://dshpstespauea001.file.core.windows.net/",
  },
});
